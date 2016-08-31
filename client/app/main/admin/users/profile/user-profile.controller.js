(function () {

    'use strict';

    function UserProfileController($http, $state, $stateParams, $mdDialog, $document, toastr, Upload) {
        var vm = this;
        
        // Data
        
        // Methods
        vm.saveData = saveData;
        vm.userId = $stateParams.id;

        //////////

        init();

        function init() {
            var id = $stateParams.id;
            $http.get('/api/users/' + id)
                .then(response => {
                    vm.data = response.data;
                })
                .catch(err => {
                    console.error(err);
                });
        }

        function saveData() {
            Upload.upload({
                url: '/api/users/' + vm.userId,
                data: {
                    name: vm.data.name,
                    oldPassword: vm.data.oldPassword,
                    newPassword: vm.data.newPassword,
                    newPasswordConfirm: vm.data.newPasswordConfirm,
                    file: vm.data.file    
                },
                method: 'PUT'
            })
                .then(response => {
                    console.info(response.data);
                    toastr.success('User updated', 'Success');
                    resetPassword();
                })
                .catch(err => {
                    console.error(err);
                    toastr.error(err.data.message, 'ERROR');
                    resetPassword();
                })
        }

        function resetPassword() {
            vm.data.oldPassword = '';
            vm.data.newPassword = '';
            vm.data.newPasswordConfirm = '';
        }
    }
    

    angular
        .module('app.ecommerce')
        .controller('UserProfileController', UserProfileController);

})();
