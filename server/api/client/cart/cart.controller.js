/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/v1/carts              ->  index
 * POST    /api/v1/carts              ->  create
 * GET     /api/v1/carts/:id          ->  show
 * PUT     /api/v1/carts/:id          ->  upsert
 * PATCH   /api/v1/carts/:id          ->  patch
 * DELETE  /api/v1/carts/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Cart from './../../admin/cart/cart.model';
import Product from './../../admin/product/product.model';

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

// Gets a list of Carts
export function index(req, res) {
    return Cart.find()
        .populate({path: "supplier", select: "name email imageUrl supplier", populate: {path: "supplier"}})
        .populate('products.product')
        .exec()
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Gets a single Cart from the DB
export function show(req, res) {
    return Cart.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

function calculateProductPrices(products, cb) {
    
}

// Creates a new Cart in the DB
export function create(req, res) {
    var supplierId = req.headers.supplier;
    if (!supplierId) {
        return res.status(400).send("Bad request");
    }

    return Cart.findOne({supplier: supplierId})
        .exec()
        .then(cart => {
            if (!cart) {
                Cart.create({
                    supplier: supplierId,
                    products: [{
                        product: req.body.product,
                        count: req.body.count
                    }]
                })
                    .then(savedCart => {
                        return index(req, res);
                    })
                    .catch(handleError(res));
            }
            else {
                if (!cart.products) {
                    cart.products = [];
                }
                
                var exist = false;
                
                cart.products.forEach(p => {
                    console.log(p);
                    if (p.product && p.product.toString() === req.body.product) {
                        p.count += +req.body.count;
                        exist = true;
                    }
                })
                
                if (!exist) {
                    cart.products.push({ product: req.body.product, count: req.body.count })
                }
                
                cart.save()
                    .then(updatedCart => {
                        return index(req, res);
                    })
                    .catch(handleError(res));
            }
        })
        .catch(handleError(res));
}

// Upserts the given Cart in the DB at the specified ID
export function upsert(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    return Cart.findOneAndUpdate(req.params.id, req.body, { upsert: true, setDefaultsOnInsert: true, runValidators: true }).exec()

        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Cart in the DB
export function patch(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    return Cart.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Cart from the DB
export function destroy(req, res) {
    return Cart.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
