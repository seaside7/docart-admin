(function ()
{
    'use strict';

    angular
        .module('app.loginV2', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.loginV2', {
            url      : '/loginV2',
            views    : {
                'main@'                       : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.loginV2': {
                    templateUrl: 'app/main/auth/login-v2/login-v2.html',
                    controller : 'LoginV2Controller as vm'
                }
            },
            bodyClass: 'login'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/auth/login-v2');
    }

})();