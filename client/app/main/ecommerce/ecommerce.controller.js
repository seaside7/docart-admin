(function() {
    'use strict';

    function eCommerceRunBlock(msApi, msNavigationService, Auth) {

        // Navigation
        msNavigationService.saveItem('ecommerce', {
            title: 'e-Commerce',
            group: true,
            weight: 1
        });

        /*
         * Categories
         */
        msNavigationService.saveItem('ecommerce.categories', {
            title: 'Categories',
            icon: 'icon-tag-multiple',
            state: 'app.categories',
            translate: 'EC.NAV.CATEGORIES',
            weight: 1,
            hidden: function() {
                return !Auth.isAdmin();
            }
        });

        /*
         * Products
         */ 
        msApi.register('ecommerce.products', ['app/data/products/products.json']);
        msNavigationService.saveItem('ecommerce.products', {
            title    : 'Products',
            icon     : 'icon-basket',
            state    : 'app.products',
            translate: 'EC.NAV.PRODUCTS',
            weight   : 1
        });

        /*
         * Orders
         */
        msNavigationService.saveItem('ecommerce.orders', {
            title: 'Orders',
            icon: 'icon-cart',
            state: 'app.orders',
            translate: 'EC.NAV.ORDERS',
            weight: 1
        });

        /*
         * Suppliers
         */
        msNavigationService.saveItem('ecommerce.suppliers', {
            title: 'Suppliers',
            icon: 'icon-truck',
            state: 'app.suppliers',
            translate: 'EC.NAV.SUPPLIERS',
            weight: 1,
            hidden: function() {
                return !Auth.isAdmin();
            }
        });
    }

    angular.module('app.ecommerce')
        .run(eCommerceRunBlock);
})();