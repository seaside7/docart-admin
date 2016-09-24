'use strict';

import passport from 'passport';
import jwt from 'jsonwebtoken';
import path from 'path';

import config from '../../../config/environment';
import shared from './../../../config/environment/shared';

import gmail from './../../../components/gmail';
import UserMessage from './../../admin/user/user.message.model';

function validationError(res, statusCode) {
    statusCode = statusCode || 422;
    return function (err) {
        res.status(statusCode).json(err);
    }
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function (err) {
        res.status(statusCode).send(err);
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


/**
 * Get inbox message
 */
export function index(req, res) {
    var query = req.query.search ? { $text: { $search: req.query.search } } : {};
    query.receiver = req.params.id;
    
    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.sort = req.query.sort;
    options.populate = [
        { path: 'receiver', select: '_id name email dob gender active imageUrl' },
        { path: 'sender', select: '_id name email dob gender active imageUrl' }
    ];

    return UserMessage.paginate(query, options)
        .then((user) => {
            return res.status(201).json(user);
        })
        .catch(handleError(res));
}

/**
 * Get outgoing message
 */
export function indexOutgoing(req, res) {
    var query = req.query.search ? { $text: { $search: req.query.search } } : {};
    query.sender = req.params.id;

    var options = (req.query.offset && req.query.limit) ? { offset: +(req.query.offset || 0), limit: +(req.query.limit || 0) } : {};
    options.sort = req.query.sort;
    options.populate = [
        { path: 'receiver', select: '_id name email dob gender active imageUrl' },
        { path: 'sender', select: '_id name email dob gender active imageUrl' }
    ];

    return UserMessage.paginate(query, options)
        .then((user) => {
            return res.status(201).json(user);
        })
        .catch(handleError(res));
}

export function destroy(req, res) {
    return UserMessage.findById(req.params.id).exec()
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
