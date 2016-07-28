(function () {

    'use strict';

    function CategoryFormDialogController($http, $mdDialog, $document) {
        var vm = this;
    
        // Data

        // Methods
        vm.closeDialog = closeDialog;
        vm.saveData = saveData;

        //////////

        init();

        /**
         * Startup
         */
        function init() {
            vm.dialogTitle = "Create Category";
        }

        /**
         * Close ngMaterial Dialog
         */
        function closeDialog() {
            $mdDialog.cancel();
        }

        /**
         * Save Data
         */
        function saveData() {
            $mdDialog.hide(vm.data);
        }
    }

    angular
        .module('app.ecommerce')
        .controller('CategoryFormDialogController', CategoryFormDialogController);

})();
