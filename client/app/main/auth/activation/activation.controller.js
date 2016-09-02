(function ()
{
    'use strict';

    angular
        .module('app.activation')
        .controller('ActivationController', ActivationController);

    /** @ngInject */
    function ActivationController($state, $stateParams)
    {
        var vm = this;
        var secretKey = $stateParams.id;

        // Data
        

        // Methods


        //////////

        init();

        function init() {
            if (secretKey !== "7f5a605053babdb0cd1ad7abccabe910") {
                $state.go("app.loginV2");
            }
        }
    }
})();