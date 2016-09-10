'use strict';

var express = require('express');
var controller = require('./supplier.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/location', controller.indexLocation);
router.get('/:id', controller.show);


module.exports = router;
