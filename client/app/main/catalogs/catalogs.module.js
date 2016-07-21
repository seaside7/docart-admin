(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.catalogs', {
        url    : '/catalogs',
        views  : {
            'content@app': {
                templateUrl: 'app/main/catalogs/catalogs.html',
                controller : 'CatalogsController as vm'
            }
        }
    });

    $translatePartialLoaderProvider.addPart('app/main/catalogs');

    msNavigationServiceProvider.saveItem('docart.catalogs', {
            title    : 'Catalogs',
            icon     : 'icon-tag-multiple',
            state    : 'app.catalogs',
            translate: 'CATALOGS.CATALOGS_NAV',
            weight   : 1
        }); 
  }

  angular.module('app.catalogs', [])
    .config(config);

})()
