(function ()
{
    'use strict';

    angular
        .module('app.components.material-docs')
        .controller('LayoutTemplateController', LayoutTemplateController);

    /** @ngInject */
    function LayoutTemplateController($state)
    {
        var vm = this;
        vm.materialVersion = '1.0.8';
        vm.component = $state.current.data;
    }

})();