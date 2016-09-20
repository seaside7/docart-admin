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
import Supplier from './../../admin/supplier/supplier.model';
import User from './../../admin/user/user.model';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
            return null;
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

// Gets a single Cart from the DB
export function show(req, res) {
    return Cart.find({ customer: req.user._id })
        .populate({ path: "supplier", select: "name email imageUrl supplier", populate: { path: "supplier" } })
        .populate('products.product')
        .populate({ path: "customer", select: "name email imageUrl gender" })
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

function fetchProduct(productId, cb) {
    return Product.findById(productId)
        .populate({ path: "owner", select: "name email imageUrl supplier", populate: { path: "supplier" } })
        .populate('category')
        .lean()
        .exec()
        .then(product => {

            if (cb) {
                if (product) {
                    return cb(null, product);
                }
                else {
                    return cb(new Error('Product not found'), null);
                }
            }
        })
        .catch(err => {
            if (cb) {
                return cb(err, null);
            }
        })
}

function getLogisticFee(supplier, courier) {
    if (supplier.supplier && supplier.supplier.logistics) {
        var cost = 0;        
        supplier.supplier.logistics.forEach(transport => {
            
            if (transport.courier.toLowerCase() === courier.toLowerCase()) {
                cost = transport.cost;
            }
        })

        return cost;
    }
    return 0;
}

function getSupplier(req, res, supplierId, cb) {
    return User.findById(supplierId)
        .populate("supplier")
        .exec()
        .then(supplier => {
            if (cb) {
                if (supplier) {
                    return cb(null, supplier)
                }
                else {
                    res.status(404).end();
                }
                return null;
            }
        })
        .catch(handleError(res));
}

function updateCart(req, res, createNew, appendCount) {

    var itemCount = req.body.count || 1;
    var courier = req.body.courier;
    var productId = req.body.product;

    // Create a new cart
    function createCart(product, itemCount, supplierId, accPrice, logisticFee, courier) {
        return Cart.create({
            customer: req.user._id,
            supplier: supplierId,
            products: [{
                product: product,
                count: itemCount,
                totalPrice: accPrice
            }],
            subTotal: accPrice,
            logistic: logisticFee,
            total: logisticFee + accPrice,
            courier: courier
        })
            .then(savedCart => {
                return show(req, res);
            })
            .catch(handleError(res));
    }

    // Update a cart
    function updateCart(cart, product, accPrice, logisticFee, courier) {
        if (!cart.products) {
            cart.products = [];
        }

        var exist = false;
        // Accumulate or update product count
        cart.products.forEach(p => {
            if (p.product && p.product.toString() === productId) {
                if (appendCount) {
                    p.count += +itemCount;
                }
                else {
                    p.count = itemCount;
                }
                p.totalPrice = accPrice;
                exist = true; 
            }
        })

        // If no products exist at the moment, add new product
        if (!exist) {
            cart.products.push({ 
                product: product, 
                count: itemCount,
                totalPrice: accPrice 
            })
        }
        
        cart.subTotal += accPrice;
        cart.total = cart.subTotal + logisticFee;
        cart.logistic = logisticFee;
        cart.courier = courier;

        return cart.save()
            .then(updatedCart => {
                return show(req, res);
            })
            .catch(handleError(res));
    }

    if (!courier || !productId) {
        return res.status(400).send("Bad request");
    }

    // Fetch the product to add to cart
    return fetchProduct(productId, (err, product) => {
        if (err) {
            res.status(404).end();
            return null;
        }

        // Accumulate price
        var accPrice = product.finalPrice * itemCount;
        if (product.prices && product.prices.length > 0) {
            product.prices.forEach(price => {
                if (itemCount >= price.minOrder) {
                    accPrice = price.price * itemCount;
                }
            })
        }

        // Fee
        if (product.category && product.category.fee) {
            var totalFee = accPrice * product.category.fee * 0.01;
            accPrice += totalFee;
        }

        if (!product.owner._id) {
            res.status(404).end("This product is not being sale by any supplier");
            return null;
        }
        var supplierId = product.owner._id;

        return getSupplier(req, res, supplierId, (err, supplier) => {

            if (err) {
                res.status(404).end();
                return null;
            }
            else {
                var logisticFee = getLogisticFee(supplier, courier);
                
                return Cart.findOne({ supplier: supplierId })
                    .exec()
                    .then(cart => {

                        if (!cart) {
                            
                            if (!createNew) {
                                res.status(404).end();
                                return null;
                            }
                            else {
                                return createCart(product, itemCount, supplierId, accPrice, logisticFee, courier);
                            }
                        }
                        else {
                            return updateCart(cart, product, accPrice, logisticFee, courier);
                        }

                    })
                    .catch(handleError(res))
            }
        })
    })
}

// Creates a new Cart in the DB
export function create(req, res) {
    
    return updateCart(req, res, true, true);
    
}

// Updates an existing Cart in the DB
export function patch(req, res) {
    
    return updateCart(req, res, false, false);

}

// Deletes a Cart from the DB
export function destroy(req, res) {
    var cartId = req.body.cartId;
    var productId = req.body.product;
    
    return Cart.findById(cartId).exec()
        .then(handleEntityNotFound(res))
        .then(cart => {
            
            if (!cart) {
                res.status(404).end("Cart not found");
                return null;
            }
            var foundIndex = -1;

            if (cart.products) {
                for (var idx = 0; idx < cart.products.length; idx ++) {
                    var product = cart.products[idx];

                    if (product.product.toString() === productId) {
                        foundIndex = idx;
                        break;
                    }
                }                
            }

            if (foundIndex === 0) {
                return cart.remove()
                    .then(removedCart => {
                        return show(req, res);
                    })
                    .catch(handleError(res));
            }
            else if (foundIndex > 0) {
                cart.products.splice(foundIndex, 1);
                return cart.save()
                    .then(savedCart => {
                        return show(req, res);
                    })
                    .catch(handleError(res));
            }
            
            return show(req, res);
        })
        .catch(handleError(res));
}
