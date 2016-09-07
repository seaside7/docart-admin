'use strict';

import User from './user.model';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import shared from './../../config/environment/shared';
import path from 'path';
import fs from 'fs-extra';
import s3 from './../../components/s3bucket';
import appRoot from 'app-root-path';
import moment from 'moment';
import sha256 from 'sha256';
import ejs from 'ejs';
import gmail from './../../components/gmail';

function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function (err) {
        res.status(statusCode).json(err);
    }
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
    };
}

function handleEntityNotFound(res) {
    return function (entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}


/**
 * Get list of users
 * restriction: 'customer'
 */
export function index(req, res) {
    var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") }, 'role': 'customer' } : { 'role': 'customer' };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.select = '_id name email dob gender active imageUrl';
    options.sort = req.query.sort;

    return User.paginate(query, options)
        .then((user) => {
            return res.status(201).json(user);
        })
        .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res, next) {

    if (!req.body && (!req.body.fullname || !req.body.phone || !req.body.email || !req.body.password || !req.body.passwordConfirm || !req.gender || !req.dob)) {
        console.log(req.body);
        return handleError(res, 400)(new Error('Bad request'));
    }

    var newUser = new User(req.body);

    if (req.body.password !== req.body.passwordConfirm) {
        return handleError(res, 403)(new Error('Password mismatch'));
    }

    if (req.files && req.files.file) {
        if (req.files.file.length > 0) {
            newUser.imageUrl = req.files.file[0].key;
        }
    }

    newUser.provider = 'local';
    newUser.name = req.body.fullname;
    newUser.role = 'customer';
    newUser.active = false;
    newUser.activationCode = sha256(req.body.fullname + req.body.email + req.body.password + moment().format('DD-MM-YYYY HH:mm:ss'));

    newUser.save()
        .then(function (user) {
            var token = jwt.sign({ _id: user._id }, config.secrets.session, {
                expiresIn: 60 * 60 * 5
            });

            var data = {
                title: 'do-cart.com',
                fullname: user.name,
                activation_link: config.domain + 'user/activate/' + user._id + '/' + user.activationCode
            }
            ejs.renderFile(path.join(req.app.get('views'), 'customer_activation.html'), data, {}, (err, html) => {
                if (err) {
                    console.log(err);
                    return;
                }

                gmail.sendGmail('donotreply@do-cart.com', user.email, 'Aktivasi akun do-cart Anda', '', html, (err, data) => {
                    if (err) {
                        console.error(err);
                    }
                });
            })

            res.status(201).json({ _id: user._id, token: token, fullname: user.name, email: user.email, active: user.active });
        })
        .catch(validationError(res));
}

/*
 * Update a customer
 * 
 */

export function update(req, res, next) {
    var userId = req.params.id;
    var name = req.body.fullname;
    var oldPass = req.body.oldPassword;
    var newPass = req.body.newPassword;
    var newPassConfirm = req.body.newPasswordConfirm;
    var imageUrl = null;

    if (req.body.password !== req.body.passwordConfirm) {
        return res.status(403).json({ message: 'Password mismatch' });
    }

    return User.findById(userId).exec()
        .then(handleEntityNotFound(res))
        .then(user => {

            if (req.files && req.files.file) {
                if (user.imageUrl) {
                    s3.s3FileRemove(appRoot.resolve(config.s3.Credentials), config.s3.Bucket, [path.basename(user.imageUrl)], (err, data) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                }

                if (req.files.file.length > 0) {
                    user.imageUrl = req.files.file[0].key;
                }
            }
            user.name = name;
            user.gender = req.body.gender;
            user.dob = req.body.dob;

            if (!oldPass && !newPass) {
                return user.save()
                    .then((user) => {
                        res.status(204).end();
                    })
                    .catch(validationError(res));
            }
            else {

                user.authenticate(oldPass, function (authError, authenticated) {
                    if (authError) {
                        return res.status(403).json({ message: 'Authentication error' });
                    }

                    if (!authenticated) {
                        return res.status(403).json({ message: 'Authentication failed' });
                    }
                    else {
                        user.password = newPass;
                        return user.save()
                            .then((user) => {
                                res.status(204).end();
                            })
                            .catch(validationError(res));
                    }
                });
            }

        })
        .catch(handleError(res));
}