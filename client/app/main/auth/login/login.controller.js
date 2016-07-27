(function ()
{
    'use strict';

    /** @ngInject */
    function LoginController($state, $http)
    {
        var vm = this;
        
        // Data
        vm.loading = false;
        vm.failed = false;

        // Methods
        vm.login = login;

        //////////

        /**
         * Login
         */
        function login(data) {
            console.log(vm.form);
            //$state.go("app.dashboard");
            vm.loading = true;
            $http.post("/auth/local", vm.form)
                .then(function(response) {
                    console.log(response);
                    vm.loading = false;
                    vm.failed = false;
                })
                .catch(function(err) {
                    vm.loading = false;
                    vm.failed = true;
                })
        }
    }

    angular
        .module('app.login')
        .controller('LoginController', LoginController);


})();