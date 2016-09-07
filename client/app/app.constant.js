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
	"userRole": {
		"guest": "guest",
		"customer": "customer",
		"supplier": "supplier",
		"user": "user",
		"admin": "admin"
	},
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
	],
	"status": {
		"ERROR": "ERR",
		"INACTIVE": "ACT",
		"OK": "OK"
	}
})

;
})(angular);