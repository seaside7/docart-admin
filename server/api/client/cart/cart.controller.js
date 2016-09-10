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


// Gets a single Cart from the DB
export function show(req, res) {
  return Cart.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Cart in the DB
export function create(req, res) {
  
  return Cart.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Cart in the DB
export function patch(req, res) {
  if(req.body._id) {
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
