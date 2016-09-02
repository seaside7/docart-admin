(function () {

    'use strict';

    function DashboardController($http, $state, toastr, Auth) {
        var vm = this;

        // Data
        vm.customerCount = 0;
        vm.supplierCount = 0;
        vm.productCount = 0;
        vm.orderCount = 0;
        vm.categoryCount = 0;
        vm.Auth = Auth;

        // Methods


        //////

        init();

        function init() {
            $http.get('/api/dashboards')
                .then(dash => {
                    vm.customerCount = dash.data.customerCount;
                    vm.supplierCount = dash.data.supplierCount;
                    vm.productCount = dash.data.productCount;
                    vm.orderCount = dash.data.orderCount;
                    vm.categoryCount = dash.data.categoryCount;
                    vm.supplierRank = dash.data.supplierRank;
                    
                    if (!dash.data.profile) {
                        Auth.getCurrentUser((user) => {
                            $state.go('app.supplier', { id: user._id });
                        });
                    }
                })
                .catch(err => {
                    toastr.error(err.data, 'ERROR');
                })
        }
    }

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

})();
