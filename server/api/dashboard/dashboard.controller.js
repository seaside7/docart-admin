/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/dashboards              ->  index
 * POST    /api/dashboards              ->  create
 * GET     /api/dashboards/:id          ->  show
 * PUT     /api/dashboards/:id          ->  update
 * DELETE  /api/dashboards/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import User from './../user/user.model';
import Product from './../product/product.model';


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

function getProductCounts(callback) {
    
}

// Gets a list of Dashboards
export function index(req, res) {
    return User.count({role: 'customer'}).exec()
        .then(customerCount => {
            return User.count({role: 'supplier'}).exec()
                .then(supplierCount => {
                    return Product.count({}).exec()
                        .then(productCount => {
                            res.status(201).json({
                                customerCount: customerCount,
                                supplierCount: supplierCount,
                                productCount: productCount
                            });
                        })
                        .catch(handleError(res));
                })
                .catch(handleError(res));
        })
        .catch(handleError(res));
}