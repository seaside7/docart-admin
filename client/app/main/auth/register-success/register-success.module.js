(function ()
{
    'use strict';

    angular
        .module('app.registerSuccess', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.registerSuccess', {
            url      : '/register/success/:id',
            views    : {
                'main@'                        : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.registerSuccess': {
                    templateUrl: 'app/main/auth/register-success/register-success.html',
                    controller : 'RegisterSuccessController as vm'
                }
            },
            bodyClass: 'register-success'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/auth/register-success');
    }

})();