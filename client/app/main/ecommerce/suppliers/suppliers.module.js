(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.suppliers', {
        url    : '/suppliers',
        views  : {
            'content@app': {
                templateUrl: 'app/main/ecommerce/suppliers/suppliers.html',
                controller : 'SuppliersController as vm'
            }
        }
    });

    $translatePartialLoaderProvider.addPart('app/main/ecommerce/suppliers');

    // Navigation
    msNavigationServiceProvider.saveItem('ecommerce', {
            title : 'eCommerce',
            group : true,
            weight: 1
        });

    msNavigationServiceProvider.saveItem('ecommerce.suppliers', {
            title    : 'Suppliers',
            icon     : 'icon-truck',
            state    : 'app.suppliers',
            /*stateParams: {
                'param1': 'page'
             },*/
            translate: 'SUPPLIERS.MENU_TITLE',
            weight   : 1
        }); 
  }

  angular.module('app.suppliers', [])
    .config(config);

})()
