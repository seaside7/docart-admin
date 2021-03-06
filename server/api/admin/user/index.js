'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../../auth/auth.service';
import * as customer from './customer.controller';
import * as message from './user.message.controller';

var router = new Router();

// Messages
router.get('/messages/sent/:id', auth.isAuthenticated(), message.indexOutgoing);
router.get('/messages/:id', auth.isAuthenticated(), message.index);
router.delete('/messages/:id', auth.isAuthenticated(), message.destroy);


// Customer
router.get('/customers', auth.isAuthenticated(), customer.index);
router.put('/customers/:id', auth.isAuthenticated(), customer.update);

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.post('/activation', controller.activation);

module.exports = router;
