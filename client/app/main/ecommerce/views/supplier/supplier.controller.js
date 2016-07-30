(function () {

    'use strict';

    function SupplierController($http, $state, $stateParams, $mdDialog, $document, toastr, Upload, _) {
        var vm = this;
        var started = false;

        // Data
        vm.supplierId = $stateParams.id;
        vm.supplierTitle = "New Supplier";
        vm.taToolbar = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        ];

        // Methods
        vm.saveData = saveData;
        vm.gotoSuppliers = gotoSuppliers;

        //////////

        init();

        function init() {
             if (vm.supplierId) {
                 $http.get('/api/suppliers/' + vm.supplierId)
                    .then((response) => {
                        var data = _.extend(response.data, response.data.supplier);
                        delete data.password;
                        vm.data = data;
                        vm.supplierTitle = data.name;
                    })
                    .catch((err) => {
                        console.error(err);
                        toastr.error(err.data, 'Error');
                    })
             }
        }

        /**
         * Create Supplier
         *
         */
        function saveData() {
            console.log(vm.data);
            var upload = {
                url: '/api/suppliers',
                data: vm.data
            };
            if (vm.supplierId) {
                upload.url = '/api/suppliers/' + vm.supplierId;
                upload.method = 'PUT';    
            }
            
            Upload.upload(upload)
                .then((response) => {
                    console.log(response);
                    toastr.success('Supplier updated', 'Success');
                    $state.go('app.suppliers');
                })
                .catch((err) => {
                    console.error(err);
                    toastr.error(err.data, 'Error');
                    $state.go('app.suppliers');
                });    
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
