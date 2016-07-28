(function() {
  'use strict';

  function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('app.users', {
        url    : '/users',
        views  : {
            'content@app': {
                templateUrl: 'app/main/admin/users/users.html',
                controller : 'UsersController',
                controllerAs: 'vm'
            }
        },
        authenticate: true,
    });

    $translatePartialLoaderProvider.addPart('app/main/admin/users');

    // Navigation
    msNavigationServiceProvider.saveItem('admin', {
        title : 'Administrator',
        group : true,
        weight: 1
    });

    msNavigationServiceProvider.saveItem('admin.users', {
        title    : 'Users',
        icon     : 'icon-tag-multiple',
        state    : 'app.users',
        translate: 'USERS.USERS_NAV',
        weight   : 1
    }); 
  }

  angular.module('app.users', [])
    .config(config);

})()
