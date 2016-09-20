'use strict';

var express = require('express');
var controller = require('./order.controller');

import config from '../../../config/environment/shared';
import * as auth from '../../../auth/auth.service';

var router = express.Router();

router.get('/', auth.isAuthenticated(config.userRole.customer), controller.index); 
router.post('/checkout', auth.isAuthenticated(config.userRole.customer), controller.checkout);
router.post('/confirm', auth.isAuthenticated(config.userRole.customer), controller.confirm);

module.exports = router;
