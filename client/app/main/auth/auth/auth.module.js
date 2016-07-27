(function ()
{
    'use strict';

    angular
        .module('app.auth', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $httpProvider)
    {
        // State
        $httpProvider.interceptors.push('authInterceptor');
    }

})();