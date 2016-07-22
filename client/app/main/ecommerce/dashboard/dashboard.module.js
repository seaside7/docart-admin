(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.dashboard', {
        url    : '/dashboard',
        views  : {
            'content@app': {
                templateUrl: 'app/main/ecommerce/dashboard/dashboard.html',
                controller : 'DashboardController as vm'
            }
        }
    });

    $translatePartialLoaderProvider.addPart('app/main/ecommerce/dashboard');

    // Navigation
    msNavigationServiceProvider.saveItem('docart', {
        title : 'DOCART',
        group : true,
        weight: 1
    });

    msNavigationServiceProvider.saveItem('docart.dashboard', {
            title    : 'Dashboard',
            icon     : 'icon-tile-four',
            state    : 'app.dashboard',
            translate: 'DASHBOARD.DASHBOARD_NAV',
            weight   : 1
        }); 
  }

  angular.module('app.dashboard', [])
    .config(config);

})()
