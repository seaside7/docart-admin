(function ()
{
    'use strict';

    angular
        .module('app.activation', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.activation', {
            url      : '/register/success/:id',
            views    : {
                'main@'                        : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.activation': {
                    templateUrl: 'app/main/auth/activation/activation.html',
                    controller : 'ActivationController as vm'
                }
            },
            bodyClass: 'activation'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/auth/activation');
    }

})();