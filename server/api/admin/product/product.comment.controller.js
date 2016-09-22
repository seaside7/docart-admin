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
import fs from 'fs-extra';
import mongoose from 'mongoose';
import appRoot from 'app-root-path';

import shared from './../../../config/environment/shared';
import config from './../../../config/environment';
import s3 from './../../../components/s3bucket';
import ProductComment from './../../admin/product/product.comment.model';

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
                    res.status(204).json({status: 'OK', message: 'Comment deleted'});
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

// Gets a list of Products
export function index(req, res) {
    if (!req.params.id) {
        res.status(400).send("Bad request");
        return null;
    }

    var query = req.query.search ? { $text: { $search: "/"+req.query.search+"/" } } : {};
    query.product = req.params.id;

    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.populate = [{path: 'sender', select: 'name email imageUrl'}, {path: 'product'}];
    options.sort = req.query.sort;
    
    return ProductComment.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}


// Deletes a Product from the DB
export function destroy(req, res) {
    if (!req.params.id) {
        res.status(400).send("Bad request");
        return null;
    }
    
    return ProductComment.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}