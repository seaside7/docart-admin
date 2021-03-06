'use strict';

import passport from 'passport';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
import compose from 'composable-middleware';
import User from '../api/admin/user/user.model';
import config from '../config/environment';
import shared from '../config/environment/shared';

var validateJwt = expressJwt({
  secret: config.secrets.session
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
export function isAuthenticated(role) {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id).exec()
        .then(user => {
          if (!user) {
            return res.status(401).end();
          }
          if (role) {
            if (user.role !== role) {
              return res.status(401).send('Access denied!');
            }
          }
          req.user = user;
          return next();
        })
        .catch(err => next(err));
    })
    .use(function(err, req, res, next) {
      if (err.name === 'UnauthorizedError') {
        res.status(401).send('Unauthorized access!');
      }
    })
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export function hasRole(roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >=
          config.userRoles.indexOf(roleRequired)) {
        next();
      } else {
        return res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
export function signToken(id, role, isClient) {
  return jwt.sign({ _id: id, role: role }, config.secrets.session, {
    expiresIn: isClient ? config.timeout.client : config.timeout.admin
  });
}

/**
 * Set token cookie directly for oAuth strategies
 */
export function setTokenCookie(req, res) {
  if (!req.user) {
    return res.status(404).send('It looks like you aren\'t logged in, please try again.');
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', token);
  res.redirect('/');
}
