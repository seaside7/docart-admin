/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/categories              ->  index
 * POST    /api/categories              ->  create
 * GET     /api/categories/:id          ->  show
 * PUT     /api/categories/:id          ->  update
 * DELETE  /api/categories/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Category from './category.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.save()
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
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
  var query = req.params.search ? { $text: { $search: req.params.search || '' } } : {};
  var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
  options.populate = {path: 'children ancestors', populate: {path: 'children ancestors'}}

  return Category.paginate(query, options)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Categories from the DB
export function show(req, res) {
  return Category.find({ancestors: []})
    .populate({path: 'children ancestors', populate: {path: 'children ancestors'}})
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Categories in the DB
export function create(req, res) {
  return Category.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Categories in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Category.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Categories from the DB
export function destroy(req, res) {
  return Category.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
