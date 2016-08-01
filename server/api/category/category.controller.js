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
import shared from './../../config/environment/shared';
import path from 'path';
import fs from 'fs-extra';


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
      if (entity.imageUrl) {
        var file = path.basename(entity.imageUrl);
        var deletePath = shared.getRelativeUploadPath(file);
        console.log("Deleting imageUrl: " + deletePath);
        fs.remove(deletePath);
      }

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
  var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") } } : {};
  var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
  options.populate = {path: 'children ancestors', populate: {path: 'children ancestors'}}
  options.sort = req.query.sort;

  return Category.paginate(query, options)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of Categories
export function indexAll(req, res) {
  return Category.find({parent: null}).populate('children').exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a list of Categories
export function mainIndex(req, res) {
  var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") }, parent: null } : { parent: null };
  var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
  options.populate = {path: 'children ancestors', populate: {path: 'children ancestors'}}
  options.sort = req.query.sort;

  return Category.paginate(query, options)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a sub Categories from the DB
export function showChilds(req, res) {
  var query = req.query.search ? { 'name': { $regex: new RegExp(req.query.search, "i") }, parent: req.params.id } : { parent: req.params.id };
  var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
  options.populate = {path: 'children ancestors', populate: {path: 'children ancestors'}}
  options.sort = req.query.sort;

  return Category.paginate(query, options)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Categories from the DB
export function show(req, res) {
  return Category.findOne({_id: req.params.id})
    .populate({path: 'children ancestors', populate: {path: 'children ancestors'}})
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Categories in the DB
export function create(req, res) {
  var body = {
    name: req.body.name,
    active: req.body.active
  };
  
  if (req.files) {
    var file = req.files.file;
    if (file) {
      body.imageUrl = shared.getUploadPath(path.basename(file.path));
    }
  }

  return Category.create(body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Creates a new sub Categories in the DB
export function createChild(req, res) {
  return Category.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(function(parent) {
      return parent.addChild(req.body)
          .then(respondWithResult(res, 201))
          .catch(handleError(res));

    })
    .catch(handleError(res));
}

// Updates an existing Categories in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  var body = {
    name: req.body.name,
    active: req.body.active
  };
  
  if (req.files) {
    var file = req.files.file;
    if (file) {
      body.imageUrl = shared.getUploadPath(path.basename(file.path));
    }
  }

  return Category.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(saveUpdates(body))
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
