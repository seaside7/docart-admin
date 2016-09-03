(function () {

    'use strict';

    function SupplierController($scope, $http, $state, $stateParams, $mdDialog, $document, toastr, Upload, Auth, Banks, Provinces, _) {
        var vm = this;
        var started = false;

        // Data
        vm.supplierId = $stateParams.id;
        vm.supplierTitle = "New Supplier";
        vm.taToolbar = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        ];
        vm.newData = vm.supplierId ? false : true;
        vm.Auth = Auth;
        vm.banks = Banks;
        vm.provinces = Provinces;
        vm.cities = [];

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

                        if (data.bankName) {
                            vm.banks.forEach(bank => {
                                if (bank.name === data.bankName) {
                                    vm.data.bank = bank;
                                }
                            })
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        toastr.error(err.data, 'Error');
                    })
            }

            $scope.$watch('vm.data.bank', bank => {
                if (bank) {
                    vm.data.bankName = bank.name;
                    vm.data.bankCode = bank.code;
                }
            })

            $scope.$watch('vm.data.province', province => {
                if (province) {
                    
                    vm.provinces.forEach(p => {
                        if (p.name === province) {
                            var cities = [];
                            p.cities.forEach(city => {
                                if (cities.indexOf(city) == -1) {
                                    cities.push(city);
                                }
                            })
                            vm.cities = cities;
                        }
                    })
                }
            })
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
                    toastr.success('Profile updated', 'Success');

                    if (Auth.isAdmin()) {
                        $state.go('app.suppliers');
                    }
                    else {
                        $state.go('app.dashboard');
                    }
                })
                .catch((err) => {
                    console.error(err);
                    toastr.error(err.data, 'Error');
                });
        }

        /**
         * Go back to suppliers
         */
        function gotoSuppliers() {
            if (Auth.isAdmin()) {
                $state.go('app.suppliers');
            }
            else {
                $state.go('app.dashboard');
            }
        }

    }

    angular
        .module('app.ecommerce')
        .controller('SupplierController', SupplierController);

})();
