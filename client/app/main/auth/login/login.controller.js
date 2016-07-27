(function ()
{
    'use strict';

    /** @ngInject */
    function LoginController($state, $http, Auth)
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
        .module('app.login')
        .controller('LoginController', LoginController);


})();