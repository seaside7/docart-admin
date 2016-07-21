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

            // Sample
            'app.sample',

            // Catalogs,
            'app.catalogs',

            // Products,
            'app.products',

            // Suppliers
            'app.suppliers'
        ]);
})();