(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.orders', {
        url    : '/orders',
        views  : {
            'content@app': {
                templateUrl: 'app/main/ecommerce/orders/orders.html',
                controller : 'OrdersController as vm'
            }
        }
    });

    $translatePartialLoaderProvider.addPart('app/main/ecommerce/orders');

    msNavigationServiceProvider.saveItem('commerce.orders', {
            title    : 'Orders',
            icon     : 'icon-cart',
            state    : 'app.orders',
            translate: 'ORDERS.ORDERS_NAV',
            weight   : 1
        }); 
  }

  angular.module('app.orders', [])
    .config(config);

})()
