'use strict';

import User from './user.model';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';
import shared from './../../config/environment/shared';
import path from 'path';
import fs from 'fs-extra';


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
    var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") } } : { };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.select = '_id name email role imageUrl';
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
        return res.status(403).json({message: 'Password mismatch'});
    }
    
    var imageUrl = null;

    if (req.files) {
        var image = req.files.image;
        imageUrl = image ? shared.getUploadPath(path.basename(image.path)) : null;
    }

    if (imageUrl) {
        newUser.imageUrl = imageUrl;
    }

    newUser.provider = 'local';
    newUser.role = 'admin';
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

    return User.findById(userId, '_id name email role imageUrl').exec()
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
        .then(function () {
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
    var userId = req.user._id;
    var name = req.body.name;
    var newPass = req.body.newPassword;
    var oldPass = req.body.oldPassword;
    var imageUrl = null;

    if (req.files) {
        var image = req.files.image;
        imageUrl = image ? shared.getUploadPath(path.basename(image.path)) : null;
    }

    return User.findById(userId).exec()
        .then(handleEntityNotFound(res))
        .then( user => {
            if (user.authenticate(oldPass)) {
                user.password = newPass;
                user.name = name;

                // Delete old image
                if (user.imageUrl && imageUrl && user.imageUrl !== imageUrl) {
                    var image = path.basename(user.imageUrl);
                    var deleteImagePath = shared.getRelativeUploadPath(image);
                    console.log("Deleting imageUrl: " + deleteImagePath);
                    fs.remove(deleteImagePath);
                }

                if (imageUrl) {
                    user.imageUrl = imageUrl;
                }

                return user.save()
                    .then(() => {
                        res.status(204).end();
                    })
                    .catch(validationError(res));
            } else {
                return res.status(403).json({message: 'Authentication failed'});
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
                return res.status(401).end();
            }
            res.json(user);
        })
        .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res, next) {
    res.redirect('/');
}
