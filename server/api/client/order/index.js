'use strict';

var express = require('express');
var controller = require('./order.controller');

import config from '../../../config/environment/shared';
import * as auth from '../../../auth/auth.service';

var router = express.Router();

router.post('/checkout', auth.isAuthenticated(config.userRole.customer), controller.checkout);

module.exports = router;
