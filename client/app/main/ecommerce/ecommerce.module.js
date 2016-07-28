(function () {
    'use strict';

    /**
     * eCommerce Module Config
     * 
     * @param {any} $stateProvider
     * @param {any} msNavigationServiceProvider
     * @param {any} $translatePartialLoaderProvider
     */
    function config($stateProvider, msApiProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
        $stateProvider
            .state('app.suppliers', {
                url: '/suppliers',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/ecommerce/views/suppliers/suppliers.html',
                        controller: 'SuppliersController as vm'
                    }
                },
                authenticate: true
            })
            .state('app.categories', {
                url: '/categories',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/ecommerce/views/categories/categories.html',
                        controller: 'CategoriesController',
                        controllerAs: 'vm'
                    }
                },
                authenticate: true,
            })
            .state('app.orders', {
                url: '/orders',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/ecommerce/views/orders/orders.html',
                        controller: 'OrdersController as vm'
                    }
                },
                authenticate: true
            })
            .state('app.products', {
                url: '/products',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/ecommerce/views/products/products.html',
                        controller: 'ProductsController as vm'
                    }
                },
                resolve: {
                    Products: function (msApi) {
                        return msApi.resolve('ecommerce.products@get');
                    }
                },
                authenticate: true
            });

        $translatePartialLoaderProvider.addPart('app/main/ecommerce');

        // Navigation
        msNavigationServiceProvider.saveItem('ecommerce', {
            title: 'eCommerce',
            group: true,
            weight: 1
        });

        /*
         * Categories
         */
        msNavigationServiceProvider.saveItem('ecommerce.categories', {
            title: 'Categories',
            icon: 'icon-tag-multiple',
            state: 'app.categories',
            translate: 'EC.NAV.CATEGORIES',
            weight: 1
        });

        /*
         * Products
         */ 
        msApiProvider.register('ecommerce.products', ['app/data/products/products.json']);
        msNavigationServiceProvider.saveItem('ecommerce.products', {
            title    : 'Products',
            icon     : 'icon-basket',
            state    : 'app.products',
            translate: 'EC.NAV.PRODUCTS',
            weight   : 1
        });

        /*
         * Orders
         */
        msNavigationServiceProvider.saveItem('ecommerce.orders', {
            title: 'Orders',
            icon: 'icon-cart',
            state: 'app.orders',
            translate: 'EC.NAV.ORDERS',
            weight: 1
        });

        /*
         * Suppliers
         */
        msNavigationServiceProvider.saveItem('ecommerce.suppliers', {
            title: 'Suppliers',
            icon: 'icon-truck',
            state: 'app.suppliers',
            translate: 'EC.NAV.SUPPLIERS',
            weight: 1
        });
    }

    angular.module('app.ecommerce', [])
        .config(config);

})()
