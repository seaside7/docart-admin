(function () {

    'use strict';

    function SupplierController($http, $state, $stateParams, $mdDialog, $document, toastr, Upload) {
        var vm = this;
        var started = false;

        // Data
        vm.supplierId = $stateParams.id;
        vm.supplierTitle = "New Supplier";

        // Methods
        vm.createData = createData;
        vm.gotoSuppliers = gotoSuppliers;

        //////////

        init();

        function init() {
             
        }

        /**
         * Create Supplier
         *
         */
        function createData() {
            
        }

        /**
         * Go back to suppliers
         */
        function gotoSuppliers() {
            $state.go('app.suppliers');
        }

    }

    angular
        .module('app.ecommerce')
        .controller('SupplierController', SupplierController);

})();
