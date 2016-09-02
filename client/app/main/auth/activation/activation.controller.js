(function ()
{
    'use strict';

    angular
        .module('app.activation')
        .controller('ActivationController', ActivationController);

    /** @ngInject */
    function ActivationController($state, $stateParams, $http)
    {
        var vm = this;
        var secretKey = $stateParams.id;
        var activationCode = $stateParams.activationCode;

        // Data
        vm.active = false;
        vm.loading = false;
        vm.description = `It’s not quite complete yet, you need to activate your account on your email. Please check your email and activate your account.`;

        // Methods
        vm.continueActivation = continueActivation;


        //////////

        init();

        function init() {
            if (!secretKey) {
                $state.go("app.loginV2");
            }

            vm.loading = true;
            var data = {
                id: secretKey
            }
            if (activationCode) {
                data.activationCode = activationCode
            }

            $http({
                url: '/api/users/activation',
                method: 'POST',
                data: data
            })
                .then(response => {
                    vm.active = response.data ? response.data.active : false;
                    vm.loading = false;
                    if (vm.active) {
                        vm.description = `Congratulations, your account is active now. Don't forget to setup your profile!`;
                    }
                })
                .catch(err => {
                    console.error(err);
                    vm.loading = false;
                    vm.description = 'Something wrong with your account, please register again with the correct informations!';
                })
        }

        function continueActivation() {
            if (vm.active) {
                $state.go('app.supplierProfile', { id: secretKey });
            }
            else {
                $state.go('app.loginV2');
            }
        }
    }
})();