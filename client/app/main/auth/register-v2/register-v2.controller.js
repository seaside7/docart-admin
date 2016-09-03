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
                    vm.loading = false;        
                    var user = response.data;
                    if (!user.active) {
                        $state.go("app.activation", {id: user._id});
                    }
                })
                .catch((err) => {
                    vm.loading = false;
                    console.error(err);
                    var errMessage = (err.data ? err.data.message : err.message) + '. Your email might already registered.'; 
                    toastr.error(errMessage);//'Something wrong, please try again', 'Error');
                });    
        }

    }
})();