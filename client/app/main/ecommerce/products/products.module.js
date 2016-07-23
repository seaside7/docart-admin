(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, msApiProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.products', {
        url    : '/products',
        views  : {
            'content@app': {
                templateUrl: 'app/main/ecommerce/products/products.html',
                controller : 'ProductsController as vm'
            }
        },
        resolve : {
            Products: function(msApi) {
                return msApi.resolve('ecommerce.products@get');
            }
        }
    });

    // API
    msApiProvider.register('ecommerce.products', ['app/data/products/products.json']);

    $translatePartialLoaderProvider.addPart('app/main/ecommerce/products');
    msNavigationServiceProvider.saveItem('ecommerce.products', {
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
