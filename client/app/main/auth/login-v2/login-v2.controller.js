(function ()
{
    'use strict';

    /** @ngInject */
    function LoginV2Controller($state, $http, Auth)
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
        function login() {
            vm.loading = true;
            vm.failed = false;
            Auth.login({ email: vm.form.email, password: vm.form.password })
                .then((err, user) => {
                    $state.go("app.dashboard");
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
        .module('app.loginV2')
        .controller('LoginV2Controller', LoginV2Controller);


})();