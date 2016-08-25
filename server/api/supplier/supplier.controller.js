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
import Supplier from './supplier.model';
import User from './../user/user.model';
import shared from './../../config/environment/shared';
import path from 'path';
import fs from 'fs-extra';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
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
            return respondWithResult(res)(user);
        })
        .catch(handleError(res));
}

// Creates a new Supplier in the DB
export function create(req, res) {
    var user = {
        provider: 'local',
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'supplier'
    };
    delete req.body.name;
    delete req.body.email;
    delete req.body.password;


    if (req.files) {
        var image = req.files.image;
        var logo = req.files.logo;
        if (image) {
            user.imageUrl = shared.getUploadPath(path.basename(image.path));
        }
        if (logo) {
            req.body.logoUrl = shared.getUploadPath(path.basename(logo.path));
        }

        delete req.body.image;
        delete req.body.logo;
    }

    return User.create(user)
        .then((user) => {
            return user.addSupplier(req.body)
                .then(respondWithResult(res, 201))
                .catch(handleError);
        })
        .catch(handleError(res));
}

// Updates an existing Supplier in the DB
export function update(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    var user = {
        provider: 'local',
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: 'supplier'
    };
    delete req.body.name;
    delete req.body.email;
    delete req.body.password;

    if (req.files) {
        var image = req.files.image;
        var logo = req.files.logo;
        if (image) {
            user.imageUrl = shared.getUploadPath(path.basename(image.path));
        }
        if (logo) {
            req.body.logoUrl = shared.getUploadPath(path.basename(logo.path));
        }

        delete req.body.image;
        delete req.body.logo;
    }

    return User.findById(req.params.id).populate('supplier').exec()
        .then(handleEntityNotFound(res))
        .then((userResult) => {
            var updateUser = _.merge(userResult, user);
            return updateUser.save()
                .then((updatedUser) => {
                    var supplier = _.merge(updatedUser.supplier, req.body);
                    supplier.save()
                        .then((updatedSupplier) => {
                            updatedUser.supplier = updatedSupplier;
                            return respondWithResult(res, 201)(updatedUser);
                        }) 
                })
        })
        .catch(handleError(res));
}

// Deletes a Supplier from the DB
export function destroy(req, res) {
    return User.findById(req.params.id).populate('supplier').exec()
        .then(handleEntityNotFound(res))
        .then((user) => {
            if (user.imageUrl) {
                var image = path.basename(user.imageUrl);
                var deleteImagePath = shared.getRelativeUploadPath(image);
                console.log("Deleting imageUrl: " + deleteImagePath);
                fs.remove(deleteImagePath);
            }

            return user.remove()
                .then((removedUser) => {
                    return removeSupplier(res, removedUser.supplier._id);
                })
                .catch(handleError(res));
        })
        .catch(handleError(res));
}

function removeSupplier(res, id) {
    return Supplier.findById(id).exec()
        .then(handleEntityNotFound(res))
        .then((supplier) => {
            if (supplier.logoUrl) {
                var logo = path.basename(supplier.logoUrl);
                var deleteLogoPath = shared.getRelativeUploadPath(logo);
                console.log("Deleting logoUrl: " + deleteLogoPath);
                fs.remove(deleteLogoPath);
            }
            return supplier.remove()
                .then(() => {
                    res.status(204).end();
                })
                .catch(handleError(res));
        })
        .catch(handleError(res));
}