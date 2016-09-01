(function ()
{
    'use strict';

    angular
        .module('app.registerV2')
        .controller('RegisterV2Controller', RegisterV2Controller);

    /** @ngInject */
    function RegisterV2Controller($state, $stateParams, $http, Auth, toastr)
    {
        var vm = this;
        var secretKey = $stateParams.id;

        // Data
        
        vm.loading = false;

        // Methods
        vm.register = register;

        //////////


        function register() {
            
            vm.loading = true;

            $http({
                url: '/api/suppliers',
                data: vm.form,
                method: 'POST' 
            })
                .then((response) => {
                    toastr.success('Your account created', 'Success');
                    vm.loading = false;        
                    $state.go("app.registerSuccess", {id: "7f5a605053babdb0cd1ad7abccabe910"});
                })
                .catch((err) => {
                    vm.loading = false;
                    console.error(err);
                    toastr.error(err.data, 'Error');
                });    
        }

    }
})();