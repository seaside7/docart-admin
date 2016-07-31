(function ()
{
    'use strict';

    /** @ngInject */
    function IndexController($rootScope, fuseTheming)
    {
        var vm = this;

        // Data
        vm.themes = fuseTheming.themes;
        $rootScope.appTitle = "DoCart";

        //////////
    }

    angular
    .module('fuse')
    .controller('IndexController', IndexController);


})();