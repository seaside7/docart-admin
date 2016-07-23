(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, msApiProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.categories', {
        url    : '/categories',
        views  : {
            'content@app': {
                templateUrl: 'app/main/ecommerce/categories/categories.html',
                controller : 'CategoriesController as vm'
            }
        },
        resolve: {
            Categories: function(msApi) {
                return msApi.resolve('ecommerce.categories@query');
            }
        }
    });

    msApiProvider.register('ecommerce.categories', ['/api/categories']);

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
