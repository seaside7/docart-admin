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
import path from 'path';
import Product from './product.model';
import Category from './../category/category.model';

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
    console.info("Index");
    return Product.find().exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Product from the DB
export function show(req, res) {
    return Product.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function catalog(req, res) {
    Category
        .findOne({ slug: req.params.slug })
        .then(function(category) {
            var categoryIds = [category._id].concat(category.children);
            return Product
                    .find( {'categories': { $in: categoryIds } } )
                    .populate('categories')
                    .exec(); 
        })
        .then(function(products) {
            console.info(products);
            respondWithResult(res, 200)(products);
        })
        .then(null, function(err) {
            handleError(res, err);
        });
}
 
export function search(req, res) {
    return Product.find({ $text: { $search: req.params.term } })
        .populate('categories')
        .exec()
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
    console.info(req.body);
    if (req.body._id) {
        delete req.body._id;
    }
    return Product.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(saveUpdates(req.body))
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