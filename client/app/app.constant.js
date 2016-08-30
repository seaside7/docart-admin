(function(angular, undefined) {
  angular.module("fuse")

.constant("appConfig", {
	"userRoles": [
		"guest",
		"customer",
		"supplier",
		"user",
		"admin"
	],
	"productUnits": [
		"Gram",
		"Ons",
		"Pon",
		"Kilogram",
		"Pcs",
		"Lusin",
		"Kodi",
		"Boks",
		"Karton"
	]
})

;
})(angular);