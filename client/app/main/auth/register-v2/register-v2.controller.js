(function ()
{
    'use strict';

    angular
        .module('app.registerV2')
        .controller('RegisterV2Controller', RegisterV2Controller);

    /** @ngInject */
    function RegisterV2Controller($state, $http, Auth)
    {
        var vm = this;

        // Data
        vm.loading = false;

        // Methods
        vm.register = register;

        //////////

        function register() {

        }

    }
})();