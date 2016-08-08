/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/orders              ->  index
 * POST    /api/orders              ->  create
 * GET     /api/orders/:id          ->  show
 * PUT     /api/orders/:id          ->  upsert
 * PATCH   /api/orders/:id          ->  patch
 * DELETE  /api/orders/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Order from './order.model';
import shared from './../../config/environment/shared';
import path from 'path';
import fs from 'fs-extra';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

function patchUpdates(patches) {
    return function (entity) {
        try {
            jsonpatch.apply(entity, patches, /*validate*/ true);
        } catch (err) {
            return Promise.reject(err);
        }

        return entity.save();
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

// Gets a list of Orders
export function index(req, res) {
    var query = req.query.search ? { 'product.$.name': { $regex: new RegExp(req.query.search, "i") }, 'supplier': req.user._id } : { 'supplier': req.user._id };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.populate = 'customer supplier product';
    options.sort = req.query.sort;

    return Order.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Order from the DB
export function show(req, res) {
    return Order.findById(req.params.id).populate('user cart').exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Order in the DB
export function create(req, res) {
    return Order.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Upserts the given Order in the DB at the specified ID
export function upsert(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    return Order.findOneAndUpdate(req.params.id, req.body, { upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()

        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Order in the DB
export function patch(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    return Order.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Order from the DB
export function destroy(req, res) {
    return Order.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
