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
                url: '/api/users',
                data: {
                    name: vm.data.name,
                    oldPassword: vm.data.oldPassword,
                    newPassword: vm.data.newPassword,
                    image: vm.data.image    
                },
                method: 'PUT'
            })
                .then(response => {
                    console.info(response.data);
                    toastr.success('User updated', 'Success');
                    vm.data.oldPassword = '';
                    vm.data.newPassword = '';
                })
                .catch(err => {
                    console.error(err);
                    toastr.error(err.data.message, 'ERROR');
                    vm.data.oldPassword = '';
                    vm.data.newPassword = '';
                })

        }
    }

    angular
        .module('app.ecommerce')
        .controller('UserProfileController', UserProfileController);

})();
