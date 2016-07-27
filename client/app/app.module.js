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

            // Login
            'app.login',

            // Sample
            'app.dashboard',

            // Catalogs,
            'app.categories',

            // Products,
            'app.products',

            // Suppliers
            'app.suppliers',

            // Orders
            'app.orders'
        ]);
})();