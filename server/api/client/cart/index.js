'use strict';

var express = require('express');
var controller = require('./cart.controller');

import config from '../../../config/environment/shared';
import * as auth from '../../../auth/auth.service';

var router = express.Router();

router.get('/', auth.isAuthenticated(config.userRole.customer), controller.index);
router.get('/:id', auth.isAuthenticated(config.userRole.customer), controller.show);
router.post('/', auth.isAuthenticated(config.userRole.customer), controller.create);
router.put('/:id', auth.isAuthenticated(config.userRole.customer), controller.upsert);
router.patch('/:id', auth.isAuthenticated(config.userRole.customer), controller.patch);
router.delete('/:id', auth.isAuthenticated(config.userRole.customer), controller.destroy);

module.exports = router;
