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
                    image: vm.data.image    
                },
                method: 'POST'
            })
                .then(response => {
                    console.info(response.data);
                    toastr.success('User created', 'Success');
                    vm.data.password = '';
                })
                .catch(err => {
                    console.error(err);
                    toastr.error(err.data.message, 'ERROR');
                    vm.data.password = '';
                })

        }
    }

    angular
        .module('app.ecommerce')
        .controller('NewUserController', NewUserController);

})();
