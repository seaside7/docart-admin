'use strict';

var express = require('express');
var controller = require('./order.controller');

import config from '../../../config/environment/shared';
import * as auth from '../../../auth/auth.service';

var router = express.Router();

router.get('/', auth.isAuthenticated(config.userRole.customer), controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.delete('/:id', controller.destroy);

module.exports = router;
