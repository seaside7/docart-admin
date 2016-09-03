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
import mongoose from 'mongoose';
import config from '../../config/environment';
import s3 from './../../components/s3bucket';
import appRoot from 'app-root-path';


function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
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
        res.status(statusCode).send(err);
    };
}

// Gets a list of Products
export function index(req, res) {
    var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") } } : {};
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    //options.select = '_id name categories price discount finalPrice stock unit rank published imageUrl owner minOrder';
    options.populate = 'owner categories category';
    options.sort = req.query.sort;

    if (req.user.role === 'supplier') {
        query.owner = req.user._id;
    }

    return Product.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Product from the DB
export function show(req, res) {
    return Product.findById(req.params.id).populate('categories category').exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Product in the DB
export function create(req, res) {

    if (req.files && req.files.images) {
        req.body.imageUrls = [];
        req.files.images.forEach((img) => {
            req.body.imageUrls.push(img.key);
        })
        req.body.imageUrl = req.body.imageUrls.length > 0 ? req.body.imageUrls[0] : '';
    }

    // Set owner of this product
    req.body.owner = req.user;

    return Product.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Updates an existing Product in the DB
export function update(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }

    if (req.body.prices) {
        req.body.prices = JSON.parse(req.body.prices);
    }

    return Product.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then((entity) => {

            var updated = _.merge(entity, req.body);

            // Force update the categories
            entity.category = req.body.category;

            // Force update the tags array
            entity.tags = [];
            if (req.body.tags) {
                req.body.tags.forEach((tag) => {
                    entity.tags.push(tag);
                })
            }

            if (!entity.imageUrls) {
                entity.imageUrls = [];
            } 

            if (req.files && req.files.images) {
                req.files.images.forEach((img) => {
                    entity.imageUrls.push(path.basename(img.key));
                })
                if (entity.imageUrl === '') {
                    entity.imageUrl = entity.imageUrls.length > 0 ? entity.imageUrls[0] : ''; 
                }
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


// Change default image
export function updateDefaultImage(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }

    return Product.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then((entity) => {

            entity.imageUrl = req.body.defaultImage;

            return entity.save()
                .then(updated => {
                    return updated;
                });
        })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

export function destroyImage(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    var deleteIndex = req.body.deleteIndex;

    return Product.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then((entity) => {

            if (deleteIndex > -1) {

                var deleteImage = entity.imageUrls[deleteIndex];
                entity.imageUrls.splice(deleteIndex, 1);
                if (deleteImage === entity.imageUrl) {
                    entity.imageUrl = entity.imageUrls.length > 0 ? entity.imageUrls[0] : '';
                }

                s3.s3FileRemove(appRoot.resolve(config.s3.Credentials), config.s3.Bucket, [path.basename(deleteImage)], (err, data) => {
                    if (err) {
                        console.error(err);
                    }
                });
            }

            return entity.save()
                .then(updated => {
                    return updated;
                });
        })
        .then(respondWithResult(res))
        .catch(handleError(res));
}