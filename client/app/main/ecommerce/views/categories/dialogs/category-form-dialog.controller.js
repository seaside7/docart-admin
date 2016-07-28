(function () {

    'use strict';

    function CategoryFormDialogController($http, $mdDialog, $document, dialogData) {
        var vm = this;
    
        // Data

        // Methods
        vm.closeDialog = closeDialog;
        vm.saveData = saveData;
        vm.data = dialogData.data;

        //////////

        init();

        /**
         * Startup
         */
        function init() {
            vm.dialogTitle = dialogData.type == "create" ? "Create Category" : "Edit Category";
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
