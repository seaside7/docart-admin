(function () {

    'use strict';

    function EditCustomerController($http, $state, $stateParams, $mdDialog, $document, toastr, Upload) {
        var vm = this;
        
        // Data
        vm.customerId = $stateParams.id;
        
        // Methods
        vm.newCustomer = newCustomer;
        vm.saveData = saveData;

        //////////

        init();

        function init() {
            if (vm.customerId) {
                $http.get('/api/users/' + vm.customerId)
                .then(response => {
                    vm.data = response.data;
                    vm.data.dob = moment(vm.data.dob).toDate();
                })
                .catch(err => {
                    console.error(err);
                });
            }
        }

        /*
         * New Customer
         */
        function newCustomer(data) {
            Upload.upload({
                url: '/api/users/customers',
                data: {
                    fullname: data.name,
                    email: data.email,
                    password: data.password,
                    passwordConfirm: data.passwordConfirm,
                    dob: data.dob.toISOString(),
                    gender: data.gender,
                    file: data.file    
                },
                method: 'POST'
            })
                .then(response => {
                    console.info(response.data);
                    toastr.success('Customer created', 'Success');
                    resetPassword();
                    $state.go('app.customers');
                })
                .catch(err => {
                    console.error(err);
                    toastr.error(err.data.message, 'ERROR');
                    resetPassword();
                })
        }

        /*
         * Update Customer
         */
        function saveData(data) {
            console.log(data.dob);
            Upload.upload({
                url: '/api/users/customers/' + data._id,
                data: {
                    fullname: data.name,
                    email: data.email,
                    password: data.password,
                    passwordConfirm: data.passwordConfirm,
                    dob: data.dob.toISOString(),
                    gender: data.gender,
                    file: data.file    
                },
                method: 'PUT'
            })
                .then(response => {
                    console.info(response.data);
                    toastr.success('Customer updated', 'Success');
                    resetPassword();
                    $state.go('app.customers');
                })
                .catch(err => {
                    console.error(err);
                    toastr.error(err.data.message, 'ERROR');
                    resetPassword();
                })

        }

        function resetPassword() {
            vm.data.password = '';
            vm.data.passwordConfirm = '';
        }
    }

    angular
        .module('app.customers')
        .controller('EditCustomerController', EditCustomerController);

})();
