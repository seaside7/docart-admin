'use strict';

var express = require('express');
var controller = require('./cart.controller');

import config from '../../../config/environment/shared';
import * as auth from '../../../auth/auth.service';

var router = express.Router();

router.get('/', auth.isAuthenticated(config.userRole.customer), controller.show);
router.post('/', auth.isAuthenticated(config.userRole.customer), controller.create);
router.post('/remove', auth.isAuthenticated(config.userRole.customer), controller.destroy);
router.put('/', auth.isAuthenticated(config.userRole.customer), controller.patch);

module.exports = router;
