'use strict';

var express = require('express');
var controller = require('./product.controller');

var router = express.Router();

router.get('/supplier/:id', controller.indexSupplier);
router.get('/category/:id', controller.indexCategory);

router.get('/', controller.index);
router.get('/home', controller.indexHome);
router.get('/:id', controller.show);

module.exports = router;
