(function ()
{
    'use strict';

    /** @ngInject */
    function config($translatePartialLoaderProvider)
    {
        $translatePartialLoaderProvider.addPart('app/toolbar');
    }

    angular
        .module('app.toolbar', [])
        .config(config);
    
})();
