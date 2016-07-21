(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.supplier', {
        url    : '/supplier',
        views  : {
            'content@app': {
                templateUrl: 'app/main/supplier/supplier.html',
                controller : 'SupplierController as vm'
            }
        }
    });

    $translatePartialLoaderProvider.addPart('app/main/supplier');

    // Navigation
    msNavigationServiceProvider.saveItem('docart', {
            title : 'DoCart',
            group : true,
            weight: 1
        });

    msNavigationServiceProvider.saveItem('docart.supplier', {
            title    : 'Supplier',
            icon     : 'icon-store',
            state    : 'app.supplier',
            /*stateParams: {
                'param1': 'page'
             },*/
            translate: 'SUPPLIER.MENU_TITLE',
            weight   : 1
        }); 
  }

  angular.module('app.supplier', [])
    .config(config);

})()
