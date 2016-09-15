/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/v1/orders              ->  index
 * POST    /api/v1/orders              ->  create
 * GET     /api/v1/orders/:id          ->  show
 * PUT     /api/v1/orders/:id          ->  upsert
 * PATCH   /api/v1/orders/:id          ->  patch
 * DELETE  /api/v1/orders/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import _ from 'lodash';
import randomJs from 'random-js';
import Order from './../../admin/order/order.model';
import Product from './../../admin/product/product.model';

var random = randomJs();

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
    return Order.find().exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Order from the DB
export function show(req, res) {
    return Order.findById(req.params.id).exec()
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

// Deletes a Order from the DB
export function destroy(req, res) {
    return Order.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}

function calculateProductOrder(products, mapProductItems, cb) {
    
    
    var sumPrice = 0;
    products.forEach(product => {

        var itemCount = mapProductItems[product._id];

        // 1. Check for stock availability
        product.outOfStock = itemCount > product.stock;


        // 2. Calculate finalPrice

        var finalPrice = product.finalPrice;

        if (product.prices && product.prices.length > 0) {

            for (var priceIdx = 0; priceIdx < product.prices.length; priceIdx++) {
                var price = product.prices[priceIdx];
                if (itemCount >= price.minOrder) {
                    finalPrice = price.price;
                    break;
                }
            }

        }

        var totalPrice = +finalPrice * itemCount;

        // 3. Calculate shipping fee
        ///////////////                
        if (product.owner) {
            // TODO:
        }

        // 4. Add price markup
        // TODO: 
        ///////////

        product.subTotalPrice = totalPrice;
        sumPrice += totalPrice;
    });

    // 5. Add transfer digit
    //sumPrice += random.integer(1, 100);

    if (cb) {
        cb(null, { totalPrice: sumPrice, products: products });
    }
}

// Inquiry order
export function inquiry(req, res) {
    if (!req.body && (!req.body.user_id || !req.body.products)) {
        return res.status(400).send("Bad request");
    }

    var mapProductItems = {};
    var productIds = [];

    req.body.products.forEach(p => {
        mapProductItems[p._id] = p.items;
        productIds.push(p._id);
    })
    
    Product.find({ _id: { $in: productIds } })
        .populate({ path: 'owner', select: '_id name email imageUrl supplier', populate: { path: 'supplier' } })
        .lean()
        .exec()
        .then(products => {

            calculateProductOrder(products, mapProductItems, (err, data) => {
                res.status(201).json(data);
            })
            
        })
        .catch(handleError(res));
}

// Checkout order
export function checkout(req, res) {
    return res.status(201).json(req.body);
}