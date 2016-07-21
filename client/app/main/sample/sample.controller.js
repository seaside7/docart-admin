(function ()
{
    'use strict';

    /** @ngInject */
    function SampleController(SampleData)
    {
        var vm = this;

        // Data
        vm.helloText = SampleData.data.helloText;

        // Methods

        //////////
    }

    angular
        .module('app.sample')
        .controller('SampleController', SampleController);
    
})();
