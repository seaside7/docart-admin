'use strict';

var express = require('express');
var controller = require('./product.controller');

import * as auth from '../../../auth/auth.service';

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.put('/image/:id/default', auth.isAuthenticated(), controller.updateDefaultImage);
router.post('/image/:id', auth.isAuthenticated(), controller.destroyImage);

module.exports = router;
