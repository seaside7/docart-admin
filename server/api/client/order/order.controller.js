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
import async from 'async';
import path from 'path';

import gmail from './../../../components/gmail';
import config from './../../../config/environment';

import Order from './../../admin/order/order.model';
import Product from './../../admin/product/product.model';
import Cart from './../../admin/cart/cart.model';

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
        console.error(err);
        res.status(statusCode).send(err);
    };
}


// Gets a single Order from the DB
export function show(req, res) {
    return Order.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}


function getCarts(req, res, cb) {
    return Cart.find({ customer: req.user._id })
        .populate({ path: "supplier", select: "name email imageUrl supplier", populate: { path: "supplier" } })
        .populate('products.product')
        .populate({ path: "customer", select: "name email imageUrl gender" })
        .exec()
        .then(handleEntityNotFound(res))
        .then(carts => {
            if (cb) {
                return cb(null, carts);
            }
        })
        .catch(handleError(res));
}

export function index(req, res) {
    return Order.find({ customer: req.user._id })
        .populate({ path: "supplier", select: "name email imageUrl supplier", populate: { path: "supplier" } })
        .populate('products.product')
        .populate({ path: "customer", select: "name email imageUrl gender" })
        .exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Checkout order
export function checkout(req, res) {

    function deductProductStock(item, cb) {
        return Product.findById(item.product._id)
            .exec()
            .then(product => {
                var stockLeft = product.stock - item.count;

                product.stock = stockLeft;
                product.save()
                    .then(savedProduct => {
                        if (cb) {
                            cb(null, savedProduct);
                        }
                    }) 
                    .catch(err => {
                        if (cb) {
                            cb(err, null);
                        }
                    })
            })
            .catch(err => {
                if (cb) {
                    cb(err, null);
                }
            })
    }

    function updateProducts(orders, cb) {
        var tasks = [];

        orders.forEach(order => {
            order.products.forEach(item => {
                tasks.push(async.apply(deductProductStock, item));
            })
        })

        async.series(tasks, cb);
    }

    // Create order for a cart
    function checkoutFn(req, transferId, cart, cb) {

        if (cart.products.length > 0) {
            for (var i = 0; i < cart.products.length; i++) {
                var p = cart.products[i];
                if (p.count > p.product.stock) {
                    if (cb) {
                        return cb(new Error(p.product.name + " is out of stock"), null);
                    }
                }
            }
        }

        var order = {
            customer: cart.customer,
            supplier: cart.supplier,
            products: cart.products,
            subTotal: cart.subTotal,
            logisticFee: cart.logistic,
            total: cart.total,
            courier: cart.courier,
            status: Order.Status().OnProcess,
            transferId: transferId,
            address: {
                receiverName: req.body.receiverName,
                phone: req.body.phone,
                address1: req.body.address1,
                address2: req.body.address2,
                city: req.body.city,
                district: req.body.district,
                province: req.body.province,
                zip: req.body.zip
            }
        }

        return Order.create(order)
            .then(savedOrder => {

                var id = savedOrder._id;

                return Order.findById(id)
                    .populate({ path: "supplier", select: "name email imageUrl supplier", populate: { path: "supplier" } })
                    .populate('products.product')
                    .populate({ path: "customer", select: "name email imageUrl gender" })
                    .exec()
                    .then(foundOrder => {
                        if (!foundOrder) {
                            res.status(404).send("Order fetch failed");
                            return null;
                        }
                        //console.log(JSON.stringify(foundOrder));

                        var data = {
                            fullname: order.supplier.name,
                            order: foundOrder,
                            total: cart.total,
                            courier: cart.courier
                        }

                        gmail.sendHtmlMail(cart.supplier.email, 'Pelanggan telah membeli produk Anda', path.join(req.app.get('views')), 'order_supplier.html', data, (err, data, html) => {
                            if (err) {
                                console.error(err);
                            }

                            return cb(null, foundOrder);
                        })
                    })
                    .catch(handleError(res));

            })
            .catch(err => {
                return cb(err, null);
            })
    }

    // Process checkout for all the carts
    return getCarts(req, res, (err, carts) => {
        var tasks = [];
        var total = 0;

        if (carts.length === 0) {
            res.status(404).json({ status: "ERROR", message: "Cart Empty" });
            return null;
        }

        // Calculate total first
        carts.forEach(cart => {
            total += cart.total;
        })

        // Calculate transfer ID
        total = total + random.integer(1, 500);
        carts.forEach(cart => {
            tasks.push(async.apply(checkoutFn, req, total, cart));
        })

        async.series(tasks, (err, results) => {
            if (err) {
                res.status(404).send(err.message);
                return null;
            }
            else {

                // Update products
                updateProducts(results, (err, products) => {

                    // Remove cars
                    Cart.remove({ customer: req.user._id })
                        .then(removedCart => {
                            var data = {
                                fullname: req.user.name,
                                carts: results,
                                total: total,
                                bankAccount: config.bankAccount
                            }

                            gmail.sendHtmlMail(req.user.email, 'Anda telah melakukan pembelian', path.join(req.app.get('views')), 'order_checkout.html', data, (err, data, html) => {
                                if (err) {
                                    console.error(err);
                                }

                                res.json({ status: "OK", orders: results });

                                return null;
                            })

                        })
                        .catch(handleError(res));
                })

            }
        });
    })
}

export function confirm(req, res) {

    function updateOrderStatus(orders) {
        return Order.update({ customer: req.user._id, status: Order.Status().OnProcess, transferId: req.body.transferId }, { status: Order.Status().Transferred }, { multi: true })
            .then(updatedOrder => {

                if (updatedOrder.ok === 1 && updatedOrder.nModified === 0) {
                    res.status(404).json({ status: "ERROR", message: "No order found" });
                    return null;
                }

                var total = 0;
                if (orders.length > 0) {
                    total = orders[0].transferId;
                }

                var confirmedData = {
                    fullname: req.user.name,
                    orders: orders,
                    total: total
                }

                gmail.sendHtmlMail(req.user.email, 'Anda telah melakukan konfirmasi pembayaran', path.join(req.app.get('views')), 'order_confirmed.html', confirmedData, (err, data, html) => {

                    gmail.sendHtmlMail(config.adminMail, 'Customer melakukan konfirmasi pembayaran', path.join(req.app.get('views')), 'order_admin_confirmed.html', confirmedData, (err, data, html) => {
                        res.json({ status: "OK", message: "Your order has been confirmed" });
                    });

                });

                return null;
            })
            .catch(handleError(res));
    }

    return Order.find({ customer: req.user._id, transferId: req.body.transferId })
        .populate({ path: "supplier", select: "name email imageUrl supplier", populate: { path: "supplier" } })
        .populate('products.product')
        .populate({ path: "customer", select: "name email imageUrl gender" })
        .exec()
        .then(orders => {
            return updateOrderStatus(orders);
        })
        .catch(handleError(res));
}

export function received(req, res) {

    function updateOrderStatus(order) {
        order.status = Order.Status().Received;
        return order.save()
            .then(updatedOrder => {

                if (updatedOrder.ok === 1 && updatedOrder.nModified === 0) {
                    res.status(404).json({ status: "ERROR", message: "No order found" });
                    return null;
                }

                var data = {
                    order: order,
                    orderId: order.orderId,
                    fullname: order.customer.name,
                    status: order.status ? order.status.toUpperCase() : Order.Status().OnProcess
                }

                return gmail.sendHtmlMail(order.customer.email, "Pesanan dengan order ID " + order.orderId + " telah berubah status", req.app.get('views'), "order_status.html", data, (err, result) => {

                    data.fullname = order.supplier.name;

                    return gmail.sendHtmlMail(order.supplier.email, "Pesanan dengan order ID " + order.orderId + " telah berubah status", req.app.get('views'), "order_status.html", data, (err, result) => {
                        res.json({ status: "OK", message: "Your order has been received" });

                        data.fullname = "Admin";
                        return gmail.sendHtmlMail(config.adminMail, "Pesanan dengan order ID " + order.orderId + " telah berubah status", req.app.get('views'), "order_status.html", data, (err, result) => {
                            return null;
                        })

                    })

                })
            })
            .catch(handleError(res));
    }

    return Order.findOne({ orderId: req.body.id })
        .populate({ path: "supplier", select: "name email imageUrl supplier", populate: { path: "supplier" } })
        .populate('products.product')
        .populate({ path: "customer", select: "name email imageUrl gender" })
        .exec()
        .then(order => {
            if (!order) {
                res.status(404).send("Invalid Order");
                return null;
            }
            else {
                return updateOrderStatus(order);
            }
        })
        .catch(handleError(res));
} 