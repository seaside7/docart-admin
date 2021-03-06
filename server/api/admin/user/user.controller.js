'use strict';

import User from './user.model';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs-extra';
import appRoot from 'app-root-path';

import shared from './../../../config/environment/shared';
import config from '../../../config/environment';
import s3 from './../../../components/s3bucket';

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
 * restriction: 'admin'
 */
export function index(req, res) {
    var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") }, 'role': 'admin' } : { 'role': 'admin' };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.select = '_id name email role gender dob imageUrl';
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
    var newUser = new User(req.body);

    if (req.body.password !== req.body.passwordConfirm) {
        return res.status(403).json({ message: 'Password mismatch' });
    }

    if (req.files && req.files.file) {
        if (req.files.file.length > 0) {
            newUser.imageUrl = req.files.file[0].key;
        }
    }

    newUser.provider = 'local';
    newUser.role = 'admin';
    newUser.active = true;
    newUser.save()
        .then(function (user) {
            var token = jwt.sign({ _id: user._id }, config.secrets.session, {
                expiresIn: 60 * 60 * 5
            });
            res.json({ token });
        })
        .catch(validationError(res));
}

/**
 * Get a single user
 */
export function show(req, res, next) {
    var userId = req.params.id;

    return User.findById(userId, '_id name email role gender dob imageUrl').exec()
        .then(user => {
            if (!user) {
                return res.status(404).end();
            }
            res.json(user);
        })
        .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
    return User.findByIdAndRemove(req.params.id).exec()
        .then(function (entity) {
            res.status(204).end();
        })
        .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res, next) {
    var userId = req.user._id;
    var oldPass = String(req.body.oldPassword);
    var newPass = String(req.body.newPassword);

    return User.findById(userId).exec()
        .then(user => {
            if (user.authenticate(oldPass)) {
                user.password = newPass;
                return user.save()
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch(validationError(res));
            } else {
                return res.status(403).end();
            }
        });
}

export function update(req, res, next) {
    var userId = req.params.id;//req.user._id;
    var name = req.body.name;
    var newPass = req.body.newPassword;
    var newPassConfirm = req.body.newPasswordConfirm;
    var oldPass = req.body.oldPassword;
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


/**
 * Get my info
 */
export function me(req, res, next) {
    var userId = req.user._id;

    return User.findOne({ _id: userId }, '-salt -password').exec()
        .then(user => { // don't ever give out the password or salt
            if (!user) {
                res.status(401).end();
                return null;
            }
            res.json(user);
            return null;
        })
        .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res, next) {
    res.redirect('/');
}


/*
 * Check User Activation
 */
export function activation(req, res) {
    if (!req.body.id) {
        return res.send(400, { error: 'Bad request' });
    }

    return User.findById(req.body.id).exec()
        .then(user => {
            if (!user) {
                res.send(400, { error: 'Invalid user, please register again with the correct informations!' });
            }
            else {
                if (req.body.activationCode && req.body.activationCode === user.activationCode) {
                    user.active = true;
                    return user.save()
                        .then((user) => {
                            var targetUrl = user.role === shared.userRole.customer ? config.website : config.domain;
                            res.status(201).json({ active: user.active, role: user.role, redirect: targetUrl });
                        })
                        .catch(handleError(res));
                }

                res.status(201).json({ active: user.active });
            }

        })
        .catch(handleError(res));
}