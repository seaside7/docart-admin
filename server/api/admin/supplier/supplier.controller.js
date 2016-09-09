/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/suppliers              ->  index
 * POST    /api/suppliers              ->  create
 * GET     /api/suppliers/:id          ->  show
 * PUT     /api/suppliers/:id          ->  update
 * DELETE  /api/suppliers/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import path from 'path';
import fs from 'fs-extra';
import appRoot from 'app-root-path';
import sha256 from 'sha256';
import moment from 'moment';
import ejs from 'ejs';

import Supplier from './supplier.model';
import User from './../user/user.model';
import Product from './../product/product.model';

import shared from './../../../config/environment/shared';
import config from './../../../config/environment';
import s3 from './../../../components/s3bucket';
import gmail from './../../../components/gmail';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            if (entity.docs) {
                var entities = entity.docs;
                entities.forEach((e) => {
                    if (e.imageUrl) {
                        e.imageUrl = config.imageHost + path.basename(e.imageUrl);
                    }
                    if (e.supplier && e.supplier.logoUrl) {
                        e.supplier.logoUrl = config.imageHost + path.basename(e.supplier.logoUrl);
                    }
                })
            }
            else {
                if (entity.imageUrl) {
                    entity.imageUrl = config.imageHost + path.basename(entity.imageUrl);
                }
                if (entity.supplier && entity.supplier.logoUrl) {
                    entity.supplier.logoUrl = config.imageHost + path.basename(entity.supplier.logoUrl);
                }
            }
            res.status(statusCode).json(entity);
        }
    };
}

function saveUpdates(updates) {
    return function (entity) {
        var updated = _.merge(entity, updates);
        return updated.save()
            .then(updated => {
                return updated;
            });
    };
}

function removeEntity(res) {
    return function (entity) {
        if (entity) {
            return entity.remove()
                .then(() => {
                    res.status(204).end();
                });
        }
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

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        console.error(err);
        res.status(statusCode).send(err);
    };
}

// Gets a list of Suppliers
export function index(req, res) {
    var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") }, 'role': 'supplier' } : { 'role': 'supplier' };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.select = '_id name email role imageUrl supplier';
    options.populate = 'supplier';
    options.sort = req.query.sort;

    return User.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Supplier from the DB
export function show(req, res) {
    User.findById(req.params.id).populate('supplier').exec()
        .then(handleEntityNotFound(res))
        .then((user) => {
            if (user.imageUrl) {
                user.imageUrl = config.imageHost + path.basename(user.imageUrl);
            }
            return respondWithResult(res)(user);
        })
        .catch(handleError(res));
}

// Creates a new Supplier in the DB
export function create(req, res) {

    if (req.body.password !== req.body.passwordConfirm) {
        return res.status(403).json({ message: 'Password mismatch' });
    }

    var user = {
        provider: 'local',
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'supplier',
        active: false,
        activationCode: sha256(req.body.name + req.body.email + req.body.password + moment().format('DD-MM-YYYY HH:mm:ss'))
    };

    if (req.files) {
        if (req.files.file && req.files.file.length > 0) {
            user.imageUrl = req.files.file[0].key;
        }
        if (req.files.images && req.files.images.length > 0) {
            req.body.logoUrl = req.files.images[0].key;
        }
    }
    
    req.body.logistics = req.body.logistics ? JSON.parse(req.body.logistics) : [];

    return User.create(user)
        .then((user) => {
            return user.addSupplier(req.body)
                .then(supplier => {

                    var data = {
                        title: 'do-cart.com',
                        fullname: user.name,
                        activation_link: config.domain + 'user/activate/'+ user._id +'/' + user.activationCode 
                    }
                    ejs.renderFile(path.join(req.app.get('views'), 'supplier_activation.html'), data, {}, (err, html) => {
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

                    respondWithResult(res, 201)({ _id: user._id, name: user.name, email: user.email, active: user.active })
                })
                .catch(handleError);
        })
        .catch(handleError(res));
}

// Updates an existing Supplier in the DB
export function update(req, res) {

    var newPass = req.body.newPassword;
    var oldPass = req.body.oldPassword;

    if (newPass !== req.body.newPasswordConfirm) {
        return res.status(403).json({ message: 'Password mismatch' });
    }

    if (req.body._id) {
        delete req.body._id;
    }
    var user = {
        provider: 'local',
        name: req.body.name,
        email: req.body.email,
        password: newPass,
        role: 'supplier',
        active: req.body.active
    };

    return User.findById(req.params.id).populate('supplier').exec()
        .then(handleEntityNotFound(res))
        .then((userResult) => {

            if (req.files) {
                if (req.files.file && req.files.file.length > 0) {
                    user.imageUrl = req.files.file[0].key;
                }
            }
            
            var updatedUser = _.merge(userResult, user);

            // if we dont pass oldPass and newPass, then we only update other data
            if (!oldPass && !newPass) {
                return updatedUser.save()
                    .then((updatedUser) => {
                        // Update logistics
                        updatedUser.supplier.logistics = req.body.logistics ? JSON.parse(req.body.logistics) : [];
                        delete req.body.logistics;
                        
                        var supplier = _.merge(updatedUser.supplier, req.body);
                        supplier.save()
                            .then((updatedSupplier) => {
                                updatedUser.supplier = updatedSupplier;
                                return respondWithResult(res, 201)(userResult);
                            })
                    })
                    .catch(handleError(res));
            }
            else {
                if (userResult.authenticate(oldPass)) {
                    updatedUser.password = newPass;
                    
                    // Update logistics
                    updatedUser.supplier.logistics = req.body.logistics ? JSON.parse(req.body.logistics) : [];
                    delete req.body.logistics;
                        
                    return updatedUser.save()
                        .then((updatedUser) => {
                            var supplier = _.merge(updatedUser.supplier, req.body);
                            supplier.save()
                                .then((updatedSupplier) => {
                                    updatedUser.supplier = updatedSupplier;
                                    return respondWithResult(res, 201)(userResult);
                                })
                        })
                        .catch(handleError(res));
                } else {
                    return res.status(403).json({ message: 'Authentication failed' });
                }
            }
        })
        .catch(handleError(res));
}

// Deletes a Supplier from the DB
export function destroy(req, res) {
    return User.findById(req.params.id).populate('supplier').exec()
        .then(handleEntityNotFound(res))
        .then((user) => {

            var removedImages = [];
            if (user.imageUrl) {
                removedImages.push(path.basename(user.imageUrl));
            }

            if (user.supplier && user.supplier.logoUrl) {
                removedImages.push(path.basename(user.supplier.logoUrl));
            }

            if (removedImages.length > 0) {
                s3.s3FileRemove(appRoot.resolve(config.s3.Credentials), config.s3.Bucket, removedImages, (err, data) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }

            // Remove all associated products
            return Product.remove({ owner: req.params.id }).exec()
                .then(() => {
                    return user.remove()
                        .then((removedUser) => {
                            return removeSupplier(res, removedUser.supplier._id);
                        })
                        .catch(handleError(res));
                })
                .catch(handleError(res));

        })
        .catch(handleError(res));
}

function removeSupplier(res, id) {
    return Supplier.findById(id).exec()
        .then(handleEntityNotFound(res))
        .then((supplier) => {
            return supplier.remove()
                .then(() => {
                    res.status(204).end();
                })
                .catch(handleError(res));
        })
        .catch(handleError(res));
}
