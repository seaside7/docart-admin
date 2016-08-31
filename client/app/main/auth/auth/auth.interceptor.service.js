'use strict';

(function () {

    function authInterceptor($rootScope, $q, $cookies, $injector, Util) {
        var state;
        return {
            // Add authorization token to headers
            request(config) {
                config.headers = config.headers || {};
                if ($cookies.get('token') && Util.isSameOrigin(config.url)) {
                    config.headers.Authorization = 'Bearer ' + $cookies.get('token');
                }
                $rootScope.loadingProgress = true;
                return config;
            },

            response: function (response) {
                $rootScope.loadingProgress = false;
                return response || $q.when(response);
            },

            // Intercept 401s and redirect you to login
            responseError(response) {
                if (response.status === 401) {
                    (state || (state = $injector.get('$state')))
                        .go('app.login');
                    // remove any stale tokens
                    $cookies.remove('token');
                }
                $rootScope.loadingProgress = false;
                return $q.reject(response);
            }
        };
    }

    angular.module('app.auth')
        .factory('authInterceptor', authInterceptor);
})();
