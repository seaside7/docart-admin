(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.products', {
        url    : '/products',
        views  : {
            'content@app': {
                templateUrl: 'app/main/products/products.html',
                controller : 'ProductsController as vm'
            }
        }
    });

    $translatePartialLoaderProvider.addPart('app/main/products');

    msNavigationServiceProvider.saveItem('commerce.products', {
            title    : 'Products',
            icon     : 'icon-basket',
            state    : 'app.products',
            translate: 'PRODUCTS.PRODUCTS_NAV',
            weight   : 1
        }); 
  }

  angular.module('app.products', [])
    .config(config);

})()
