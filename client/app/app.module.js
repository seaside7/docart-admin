(function ()
{
    'use strict';

    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [

            // mdDataTable,
            'mdDataTable',
            
            // Core
            'app.core',

            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Quick panel
            'app.quick-panel',

            // Sample
            'app.dashboard',

            // Catalogs,
            'app.catalogs',

            // Products,
            'app.products',

            // Suppliers
            'app.suppliers',

            // Orders
            'app.orders'
        ]);
})();