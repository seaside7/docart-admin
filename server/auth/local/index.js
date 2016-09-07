'use strict';

import express from 'express';
import passport from 'passport';
import shared from '../../config/environment/shared';
import {signToken} from '../auth.service';

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }

    if (user.role !== shared.userRole.admin && user.role !== shared.userRole.supplier &&
        user.role !== shared.userRole.agent) {
      return res.status(403).json({message: 'Access denied!'});
    }
 
    var token = signToken(user._id, user.role);
    
    res.json({ token: token, user: user });
  })(req, res, next)
});

router.post('/user', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({message: 'Something went wrong, please try again.'});
    }

    if (user.role !== shared.userRole.customer) {
      return res.status(403).json({message: 'Access denied!'});
    }

    var token = signToken(user._id, user.role);
    
    res.json({ token: token, user: user });
  })(req, res, next)
});

export default router;
