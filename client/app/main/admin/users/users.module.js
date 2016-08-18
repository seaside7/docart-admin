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

    function usersRun(msNavigationService, Auth) {

        console.log('=----------------------RUN-------------------------');
        console.log(Auth.isAdmin());

        // Navigation
        msNavigationService.saveItem('admin', {
            title: 'Administrator',
            group: true,
            weight: 2,
            hidden: function () {
                return !Auth.isAdmin();
            }
        });

        msNavigationService.saveItem('admin.users', {
            title: 'Users',
            icon: 'icon-tag-multiple',
            state: 'app.users',
            translate: 'USERS.USERS_NAV',
            weight: 2,
            hidden: function () {
                return !Auth.isAdmin();
            }
        });

    }

    angular.module('app.users', [])
        .config(config)
        .run(usersRun);

})()
