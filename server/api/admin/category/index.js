'use strict';

var express = require('express');
var controller = require('./category.controller');
var auth = require('./../../../auth/auth.service');

var router = express.Router();

router.get('/all', auth.isAuthenticated(), controller.indexAll);
router.get('/main', auth.isAuthenticated(), controller.indexMain);
router.get('/subs/:id', auth.isAuthenticated(), controller.indexSubcategories);

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/subs/:id', auth.isAuthenticated(), controller.createChild);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
