/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below

  // Client endpoints
  app.use('/api/v1/customers', require('./api/client/customer'));
  app.use('/api/v1/carts', require('./api/client/cart'));

  // Admin Endpoints
  app.use('/api/dashboards', require('./api/admin/dashboard'));
  app.use('/api/carts', require('./api/admin/cart'));
  app.use('/api/suppliers', require('./api/admin/supplier'));
  app.use('/api/orders', require('./api/admin/order'));
  app.use('/api/categories', require('./api/admin/category'));
  app.use('/api/products', require('./api/admin/product'));
  app.use('/api/users', require('./api/admin/user')); 

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
