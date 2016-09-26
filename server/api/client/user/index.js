'use strict';

var express = require('express');
var controller = require('./user.controller');
var message = require('./user.message.controller');

import config from '../../../config/environment/shared';
import * as auth from '../../../auth/auth.service';

var router = express.Router();

router.get('/', controller.index);
router.post('/', controller.create);
router.put('/:id', controller.update);

router.post('/activation/resend', controller.activationResend);

router.get('/messages', auth.isAuthenticated(config.userRole.customer), message.index);
router.get('/messages/sent', auth.isAuthenticated(config.userRole.customer), message.indexOutgoing);
router.post('/messages', auth.isAuthenticated(config.userRole.customer), message.create);
//router.delete('/messages/:id', auth.isAuthenticated(config.userRole.customer), message.destroy);

module.exports = router;
