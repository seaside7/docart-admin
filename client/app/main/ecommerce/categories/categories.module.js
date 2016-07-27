(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.categories', {
        url    : '/categories',
        views  : {
            'content@app': {
                templateUrl: 'app/main/ecommerce/categories/categories.html',
                controller : 'CategoriesController',
                controllerAs: 'vm'
            }
        },
        authenticate: true,
    });

    $translatePartialLoaderProvider.addPart('app/main/ecommerce/categories');

    msNavigationServiceProvider.saveItem('ecommerce.categories', {
            title    : 'Categories',
            icon     : 'icon-tag-multiple',
            state    : 'app.categories',
            translate: 'CATEGORIES.CATEGORIES_NAV',
            weight   : 1
        }); 
  }

  angular.module('app.categories', [])
    .config(config);

})()
