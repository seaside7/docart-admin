(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.suppliers', {
        url    : '/suppliers',
        views  : {
            'content@app': {
                templateUrl: 'app/main/suppliers/suppliers.html',
                controller : 'SuppliersController as vm'
            }
        }
    });

    $translatePartialLoaderProvider.addPart('app/main/suppliers');

    // Navigation
    msNavigationServiceProvider.saveItem('docart', {
            title : 'DoCart',
            group : true,
            weight: 1
        });

    msNavigationServiceProvider.saveItem('docart.suppliers', {
            title    : 'Suppliers',
            icon     : 'icon-store',
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
