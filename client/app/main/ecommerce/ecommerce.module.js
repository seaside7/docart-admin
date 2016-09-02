(function () {
    'use strict';

    /**
     * eCommerce Module Config
     * 
     * @param {any} $stateProvider
     * @param {any} msNavigationServiceProvider
     * @param {any} $translatePartialLoaderProvider
     */
    function config($stateProvider, msApiProvider, $translatePartialLoaderProvider) {
        $translatePartialLoaderProvider.addPart('app/main/ecommerce');

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
            .state('app.supplier', {
                url: '/supplier/:id',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/ecommerce/views/supplier/supplier.html',
                        controller: 'SupplierController as vm'
                    }
                },
                authenticate: true,
                resolve  : {
                    Banks: function(msApi)
                    {
                        return msApi.resolve('e-commerce.banks@query');
                    }
                }
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
            .state('app.subcategories', {
                url: '/categories/sub/:id',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/ecommerce/views/categories.sub/sub.categories.html',
                        controller: 'SubCategoriesController',
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
                authenticate: true
            })
            .state('app.product', {
                url: '/products/edit/:id',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/ecommerce/views/product/product.html',
                        controller: 'ProductController as vm'
                    }
                },
                authenticate: true
            });

            //e-commerce.banks
            msApiProvider.register('e-commerce.banks', ['app/data/bank.json']);
    }

    angular.module('app.ecommerce', [])
        .config(config);

})()
