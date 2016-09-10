/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/v1/suppliers              ->  index
 * POST    /api/v1/suppliers              ->  create
 * GET     /api/v1/suppliers/:id          ->  show
 * PUT     /api/v1/suppliers/:id          ->  upsert
 * PATCH   /api/v1/suppliers/:id          ->  patch
 * DELETE  /api/v1/suppliers/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import _ from 'lodash';
import User from './../../admin/user/user.model';
import Supplier from './../../admin/supplier/supplier.model';

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
        console.error(err);
        res.status(statusCode).send(err);
    };
}

// Gets a list of Suppliers
export function index(req, res) {
    var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") }, 'role': 'supplier' } : { 'role': 'supplier' };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.select = '_id name email imageUrl supplier';
    options.populate = 'supplier';
    options.sort = req.query.sort;

    return User.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a list of Suppliers specific to a given location
export function indexLocation(req, res) {

    var query = req.query.search ?
        { 'name': { $regex: new RegExp(req.query.search, "i") } } : 
        { };

    if (req.query.province) {
        query.province = new RegExp(req.query.province, "i");
    }        

    if (req.query.city) {
        query.city = new RegExp(req.query.city, "i")//req.query.city;
    }

    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 20) } : {};
    options.populate = {path: 'user', populate: { path: 'supplier' }, select: '_id name email active imageUrl supplier' };
    options.sort = '-rank';

    return Supplier.paginate(query, options)
        .then(entity => {
            var docs = [];
            if (entity.docs) {
                entity.docs.forEach(e => {
                    if (e.user && e.user.active) {
                        docs.push(e.user);
                    }
                })
            }
            entity.docs = docs;
            console.log(JSON.stringify(entity));

            return respondWithResult(res)(entity);
        })
        .catch(handleError(res));
}

// Gets a single Supplier from the DB
export function show(req, res) {
    User.findById(req.params.id).populate('supplier').select('_id name email imageUrl supplier').exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}


