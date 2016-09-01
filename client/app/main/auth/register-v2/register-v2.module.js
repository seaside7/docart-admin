(function ()
{
    'use strict';

    angular
        .module('app.registerV2', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.registerV2', {
            url      : '/registerV2',
            views    : {
                'main@'                          : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.registerV2': {
                    templateUrl: 'app/main/auth/register-v2/register-v2.html',
                    controller : 'RegisterV2Controller as vm'
                }
            },
            bodyClass: 'register-v2'
        });

        // Translate
        $translatePartialLoaderProvider.addPart('app/main/auth/register-v2');
    }

})();