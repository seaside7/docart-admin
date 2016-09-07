(function () {
    'use strict';

    function config($stateProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
        $stateProvider
            .state('app.customers', {
                url: '/customers',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/admin/customers/customers.html',
                        controller: 'CustomersController',
                        controllerAs: 'vm'
                    }
                },
                authenticate: true,
            })
            .state('app.customer_profile', {
                url: '/customer/profile/:id',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/admin/customers/profile/customer-profile.html',
                        controller: 'EditCustomerController',
                        controllerAs: 'vm'
                    }
                },
                authenticate: true,
            })
            .state('app.new_customer', {
                url: '/customer/new',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/admin/customers/profile/new-customer.html',
                        controller: 'EditCustomerController',
                        controllerAs: 'vm'
                    }
                },
                authenticate: true,
            });
    }

    function run(msNavigationService, Auth) {
        // Navigation
      
        msNavigationService.saveItem('admin.customers', {
            title: 'Customers',
            icon: 'icon-account-circle',
            state: 'app.customers', 
            translate: 'CUSTOMERS.CUSTOMERS_NAV',
            weight: 2,
            hidden: function () {
                return !Auth.isAdmin();
            }
        });

    }

    angular.module('app.customers', [])
        .config(config)
        .run(run);

})()
