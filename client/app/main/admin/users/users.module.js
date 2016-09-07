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
            })
            .state('app.new_user', {
                url: '/user/new',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/admin/users/profile/new-user.html',
                        controller: 'NewUserController',
                        controllerAs: 'vm'
                    }
                },
                authenticate: true,
            });

        $translatePartialLoaderProvider.addPart('app/main/admin');
    }

    function usersRun(msNavigationService, Auth) {
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
            title: 'Users s',
            icon: 'icon-account-multiple',
            state: 'app.users', 
            translate: 'USERS.USERS_NAV',
            weight: 3,
            hidden: function () {
                return !Auth.isAdmin();
            }
        });

    }

    angular.module('app.users', [])
        .config(config)
        .run(usersRun);

})()
