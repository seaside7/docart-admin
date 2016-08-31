(function () {

    'use strict';

    function NewUserController($http, $state, $stateParams, $mdDialog, $document, toastr, Upload) {
        var vm = this;
        
        // Data
        
        // Methods
        vm.saveData = saveData;

        //////////

        init();

        function init() {
        }

        function saveData() {
            Upload.upload({
                url: '/api/users',
                data: {
                    name: vm.data.name,
                    email: vm.data.email,
                    password: vm.data.password,
                    passwordConfirm: vm.data.passwordConfirm,
                    file: vm.data.file    
                },
                method: 'POST'
            })
                .then(response => {
                    console.info(response.data);
                    toastr.success('User created', 'Success');
                    resetPassword();
                    $state.go('app.users');
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
        .module('app.ecommerce')
        .controller('NewUserController', NewUserController);

})();
