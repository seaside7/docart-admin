(function ()
{
    'use strict';

    /** @ngInject */
    function LoginController($state)
    {
        var vm = this;
        
        // Data
        

        // Methods
        vm.login = login;

        //////////

        /**
         * Login
         */
        function login(data) {
            console.log(vm.form);
            $state.go("app.dashboard");
        }
    }

    angular
        .module('app.login')
        .controller('LoginController', LoginController);


})();