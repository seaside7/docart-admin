'use strict';

var express = require('express');
var controller = require('./category.controller');
var auth = require('./../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/main', controller.mainIndex);
router.get('/subs/:id', controller.showChilds); 

router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/subs/:id', controller.createChild);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
