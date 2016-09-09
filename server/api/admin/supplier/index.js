'use strict';

var express = require('express');
var controller = require('./supplier.controller');
var gmail = require('./../../../components/gmail');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.get('/gmail/send', (req, res) => {
    gmail.sendGmail('<info@do-cart.com>', '<syuaibi@gmail.com>', "hello", '', '<b>Good bye</b>', (err, data) => {
        if (err) {
            res.status(500).json(err.message);
        }
        else {
            res.status(201).json(data);
        }
    });
})

module.exports = router;
