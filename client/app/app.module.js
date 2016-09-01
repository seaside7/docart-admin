(function ()
{
    'use strict';

    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [

            // Core
            'app.core',

            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Quick panel
            'app.quick-panel',

            // Auth
            'app.auth',

            // Login
            'app.login',

            // LoginV2
            'app.loginV2',

            // Register V2
            'app.registerV2',

            // Register Success
            'app.registerSuccess',

            // Sample
            'app.dashboard',

            // eCommerce,
            'app.ecommerce',

            // Users
            'app.users'
        ]);
})();