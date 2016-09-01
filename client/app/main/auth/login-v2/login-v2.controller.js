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
        vm.errorMessage = "Invalid email or password, please try again!";

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
                    vm.errorMessage = err.message;
                    $state.go("app.registerSuccess", {id: "7f5a605053babdb0cd1ad7abccabe910"});
                })
        }
    }

    angular
        .module('app.loginV2')
        .controller('LoginV2Controller', LoginV2Controller);


})();