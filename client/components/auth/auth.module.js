'use strict';

angular.module('docartAdminApp.auth', ['docartAdminApp.constants', 'docartAdminApp.util',
    'ngCookies', 'ui.router'
  ])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
