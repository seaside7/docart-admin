(function(angular, undefined) {
  angular.module("fuse")

.constant("appConfig", {
	"userRoles": [
		"guest",
		"customer",
		"supplier",
		"user",
		"admin"
	]
})

;
})(angular);