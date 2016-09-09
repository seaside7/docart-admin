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
import Category from './../category/category.model';
import Product from './../product/product.model';
import Order from './../order/order.model';
import Supplier from './../supplier/supplier.model';

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

// Gets a list of Dashboards
export function index(req, res) {

    var result = {};

    // Product count
    return Product.count({owner: req.user._id}).exec()
        .then(productCount => {
            
            result.productCount = productCount;
            
            // Order count
            return Order.count({supplier: req.user._id}).exec()
                .then(orderCount => {

                    result.orderCount = orderCount;

                    if (req.user.role === "admin") {

                        // Main Categories
                        return Category.count({}).exec()
                            .then(categoryCount => {

                                result.categoryCount = categoryCount;

                                // Customer count
                                return User.count({ role: 'customer' }).exec()
                                    .then(customerCount => {

                                        result.customerCount = customerCount;

                                        // Supplier count
                                        return User.count({ role: 'supplier' }).exec()
                                            .then(supplierCount => {

                                                result.profile = true;
                                                result.supplierCount = supplierCount;

                                                return res.status(201).json(result);
                                            })
                                            .catch(handleError(res));
                                    })
                                    .catch(handleError(res));
                                
                            });
                    }
                    else if (req.user.role === 'supplier') {
                        
                        // Find supplier 
                        Supplier.findById(req.user.supplier).exec()
                            .then((supplier) => {
                                
                                result.supplierRank = supplier ? supplier.rank : 0;
                            
                                // Check if user need to setup their profile
                                result.profile = !(!supplier.address && !supplier.city && !supplier.province)     
                                    
                                return res.status(201).json(result);
                            })
                            .catch(handleError(res));
                    }
                    else {
                        res.status(403).end();
                    }
                })
        })
        .catch(handleError(res));
}
