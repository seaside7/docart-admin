(function ()
{
    'use strict';

    angular
        .module('fuse')
        .constant("appConfig", {
            "userRoles": [
                "guest",
                "user",
                "admin"
            ]
        });
        
})();
