/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/v1/categories              ->  index
 * POST    /api/v1/categories              ->  create
 * GET     /api/v1/categories/:id          ->  show
 * PUT     /api/v1/categories/:id          ->  upsert
 * PATCH   /api/v1/categories/:id          ->  patch
 * DELETE  /api/v1/categories/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Category from './../../admin/category/category.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Categories
export function index(req, res) {
    return Category.find({ parent: null }).populate('children').exec()
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a sub Categories from the DB
export function indexSubs(req, res) {
    var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") }, parent: req.params.id } : { parent: req.params.id };
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.populate = { path: 'children ancestors', populate: { path: 'children ancestors' } }
    options.sort = req.query.sort;

    return Category.paginate(query, options)
        .then(respondWithResult(res))
        .catch(handleError(res));
}
