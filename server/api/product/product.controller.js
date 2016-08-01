/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/products              ->  index
 * POST    /api/products              ->  create
 * GET     /api/products/:id          ->  show
 * PUT     /api/products/:id          ->  update
 * DELETE  /api/products/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Product from './product.model';
import Category from './../category/category.model';
import shared from './../../config/environment/shared';
import path from 'path';
import fs from 'fs-extra';

function saveFile(res, file) {
    return function(entity) {
        var newPath = '/assets/uploads' + path.basename(file.path);
        entity.imageUrl = newPath;
        return entity.saveAsync().spread(function(updated) {
            console.log("=> updated");
            return updated;
        });
    }
}

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

function saveUpdates(updates) {
    return function(entity) {
        var updated = _.merge(entity, updates);
        return updated.save()
            .then(updated => {
                return updated;
            });
    };
}

function removeEntity(res) {
    return function(entity) {
        if (entity) {
            return entity.remove()
                .then(() => {
                    res.status(204).end();
                });
        }
    };
}

function handleEntityNotFound(res) {
    return function(entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode).send(err);
    };
}

export function uploads(req, res) {
    var file = req.files.file;
    if (!file) {
        return handleError(res)('File not provided');
    }

    Product.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(saveFile(res, file))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a list of Products
export function index(req, res) {
    var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") } } : { };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.select = '_id name email role imageUrl supplier customer';
    options.populate = 'supplier';
    options.sort = req.query.sort;

    if (req.user.role !== 'admin') {
        
    }

    return Product.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Product from the DB
export function show(req, res) {
    return Product.findById(req.params.id).populate('categories').exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Product in the DB
export function create(req, res) {
    return Product.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Updates an existing Product in the DB
export function update(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    return Product.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then((entity) => {
            var updated = _.merge(entity, req.body);
            
            // Force update the categories
            entity.categories = req.body.categories;
            
            // Set owner of this product
            console.log(req.user);
            if (req.user.role !== 'admin') {
                entity.owner = req.user; 
            }

            // Force update the tags array
            entity.tags = [];
            if (req.body.tags) {
                req.body.tags.forEach((tag) => {
                    entity.tags.push(tag);
                })
            }
            
            return updated.save()
            .then(updated => {
                return updated;
            });
        })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Product from the DB
export function destroy(req, res) {
    return Product.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}