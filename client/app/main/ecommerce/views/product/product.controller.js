(function () {

    'use strict';

    function ProductController($state, $stateParams, $http) {
        var vm = this;

        // Data
        vm.productTitle = 'New Product';
        
        // Methods
        vm.goBack = goBack;

        //////////

        init();

        function init() {

        }

        function goBack() {
            $state.go('app.products');
        }
    }

    angular
        .module('app.ecommerce')
        .controller('ProductController', ProductController);

})();
