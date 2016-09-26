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
import path from 'path';
import fs from 'fs-extra';

import Order from './order.model';
import shared from './../../../config/environment/shared';
import gmail from './../../../components/gmail';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function (entity) {
        if (entity) {
            res.status(statusCode).json(entity);
            return null;
        }
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
        console.log(err);
        res.status(statusCode).send(err);
    };
}

// Gets a list of Orders
export function index(req, res) {
    var query = req.query.search ? { $text: { $search: req.query.search } } : {};
    if (req.user.role === shared.userRole.supplier) {
        query.supplier = req.user._id;
    }

    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.populate = 'customer supplier products.product';
    options.sort = req.query.sort || '-created';

    return Order.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Order from the DB
export function show(req, res) {
    return Order.findById(req.params.id)
        .populate({ path: "supplier", select: "name email imageUrl supplier", populate: { path: "supplier" } })
        .populate('products.product')
        .populate({ path: "customer", select: "name email imageUrl gender" })
        .exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Order in the DB
export function patch(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }

    return Order.findById(req.params.id)
        .populate({ path: "supplier", select: "name email imageUrl supplier", populate: { path: "supplier" } })
        .populate('products.product')
        .populate({ path: "customer", select: "name email imageUrl gender" })
        .exec()
        .then(handleEntityNotFound(res))
        .then(order => {
            order.messages = req.body.messages;
            order.status = req.body.status;

            return order.save();
        })
        .then(order => {

            var data = {
                order : order,
                orderId: order.orderId,
                fullname: order.supplier.name,
                status: order.status.toUpperCase()
            }
            
            return gmail.sendHtmlMail(order.supplier.email, "Pesanan dengan order ID " + order.orderId + " telah berubah status", req.app.get('views'), "order_status.html", data, (err, result) => {
                data.fullname = order.customer.name;

                if (order.status === Order.Status.SupplierPaid) {
                    return respondWithResult(res)(order);
                }
                else {
                    return gmail.sendHtmlMail(order.customer.email, "Pesanan dengan order ID " + order.orderId + " telah berubah status", req.app.get('views'), "order_status.html", data, (err, result) => {    
                        return respondWithResult(res)(order);
                    })
                }
            })
                
            
        })
        .catch(handleError(res));
}

// Deletes a Order from the DB
export function destroy(req, res) {
    return Order.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
