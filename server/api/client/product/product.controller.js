/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/v1/products              ->  index
 * POST    /api/v1/products              ->  create
 * GET     /api/v1/products/:id          ->  show
 * PUT     /api/v1/products/:id          ->  upsert
 * PATCH   /api/v1/products/:id          ->  patch
 * DELETE  /api/v1/products/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import mongoose from 'mongoose';
import Product from './../../admin/product/product.model';

var ObjectId = mongoose.Types.ObjectId

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

// Gets a list of Products
export function index(req, res) {
    var query = req.query.search ? 
        { published: true, 'name': { $regex: new RegExp(req.query.search, "i") } } : 
        { published: true };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    //options.select = '_id name categories price discount finalPrice stock unit rank published imageUrl owner minOrder';
    options.populate = 'owner categories category';
    options.sort = req.query.sort;

    return Product.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Get a list of Products home summary
export function indexHome(req, res) {

    function handleResult(e) {
        return e;
    }

    function getBestRankProducts() {
        return Product.paginate({published: true}, { offset: 0, limit: 15, sort: '-rank' })
            .then(entity => {
                return handleResult(entity.docs);
            })
            .catch(handleError(res));
    }

    function getFeaturedProducts() {
        return Product.paginate({ featured: true, published: true }, { offset: 0, limit: 15, sort: '-finalPrice' })
            .then(entity => {
                return handleResult(entity.docs);
            })
            .catch(handleError(res));
    }

    function getLowPriceProducts() {
        return Product.paginate({}, { offset: 0, limit: 15, sort: '-finalPrice' })
            .then(entity => {
                return handleResult(entity.docs);
            })
            .catch(handleError(res));
    }

    var _lowPrices = [];
    var _featured = [];

    return getLowPriceProducts()
        .then(lowPrices => {
            _lowPrices = lowPrices;

            return getFeaturedProducts();
        })
        .then(featured => {
            _featured = featured;

            return getBestRankProducts();
        })
        .then(best => {
            res.status(200).json({ bestRank: best, featured: _featured, lowPrice: _lowPrices });
        })
}

// Get products for certain supplier
export function indexSupplier(req, res) {
    var supplierId = req.params.id;
    if (!supplierId) {
        return res.status(400).send("Bad request");
    }

    var query = req.query.search ? 
        { 'owner' : new ObjectId(supplierId), 'name': { $regex: new RegExp(req.query.search, "i") }, published: true } : //, 
        { 'owner' : new ObjectId(supplierId), published: true };
        
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    //options.select = '_id name categories price discount finalPrice stock unit rank published imageUrl owner minOrder';
    options.populate = 'categories category';
    options.sort = req.query.sort;

    return Product.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Get products for a certain category
export function indexCategory(req, res) {
    var categoryId = req.params.id;
    if (!categoryId) {
        return res.status(400).send("Bad request");
    }

    var query = req.query.search ? 
        { 'category' : new ObjectId(categoryId), 'name': { $regex: new RegExp(req.query.search, "i") }, published: true } : //, 
        { 'category' : new ObjectId(categoryId), published: true };
        
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    //options.select = '_id name categories price discount finalPrice stock unit rank published imageUrl owner minOrder';
    options.populate = 'category';
    options.sort = req.query.sort;

    return Product.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}


// Gets a single Product from the DB
export function show(req, res) {
    return Product.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}