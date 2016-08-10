(function () {
    'use strict';

    function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
        $stateProvider
            .state('app.users', {
                url: '/users',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/admin/users/users.html',
                        controller: 'UsersController',
                        controllerAs: 'vm'
                    }
                },
                authenticate: true,
            })
            .state('app.user_profile', {
                url: '/user/profile/:id',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/admin/users/profile/user-profile.html',
                        controller: 'UserProfileController',
                        controllerAs: 'vm'
                    }
                },
                authenticate: true,
            });

        $translatePartialLoaderProvider.addPart('app/main/admin/users');
    }

    angular.module('app.users', [])
        .config(config);

})()
