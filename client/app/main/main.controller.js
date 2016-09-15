(function ()
{
    'use strict';

    /** @ngInject */
    function MainController($scope, $rootScope, $http)
    {
        // Data

        //////////

        // Remove the splash screen
        $scope.$on('$viewContentAnimationEnded', function (event)
        {
            if ( event.targetScope.$id === $scope.$id )
            {
                $rootScope.$broadcast('msSplashScreen::remove');
            }
        });
    }

    angular
        .module('fuse')
        .controller('MainController', MainController);
    
})();