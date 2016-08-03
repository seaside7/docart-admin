(function () {

    'use strict';

    function DashboardController($http, $state, toastr) {
        var vm = this;

        // Data
        vm.customerCount = 0;
        vm.supplierCount = 0;
        vm.productCount = 0;

        // Methods


        //////
        
        init();

        function init() {
            $http.get('/api/dashboards')
                .then(dash => {
                    vm.customerCount = dash.data.customerCount;
                    vm.supplierCount = dash.data.supplierCount;
                    vm.productCount = dash.data.productCount;
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
