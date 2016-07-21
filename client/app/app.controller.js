(function ()
{
    'use strict';

    /** @ngInject */
    function IndexController(fuseTheming)
    {
        var vm = this;

        // Data
        vm.themes = fuseTheming.themes;

        //////////
    }

    angular
    .module('fuse')
    .controller('IndexController', IndexController);


})();