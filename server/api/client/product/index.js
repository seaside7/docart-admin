'use strict';

var express = require('express');
var controller = require('./product.controller');
var commentController = require('./product.comment.controller');

import * as auth from '../../../auth/auth.service';
import config from '../../../config/environment/shared';

var router = express.Router();

router.get('/supplier/:id', controller.indexSupplier);
router.get('/category/:id', controller.indexCategory);

router.get('/', controller.index);
router.get('/home', controller.indexHome);
router.get('/:id', controller.show);

router.post('/comments', auth.isAuthenticated(config.userRole.customer), commentController.create);
router.get('/comments/:id', commentController.index);
router.delete('/comments/:id', auth.isAuthenticated(config.userRole.customer), commentController.destroy);


module.exports = router;
