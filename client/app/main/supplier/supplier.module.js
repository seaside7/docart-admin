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

    msNavigationServiceProvider.saveItem('app.supplier', {
            title    : 'Supplier',
            icon     : 'icon-tile-four',
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
