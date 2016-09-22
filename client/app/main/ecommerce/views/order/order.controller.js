(function () {

    'use strict';

    function OrderController($scope, $state, $stateParams, $http, $document, toastr, Upload, Auth, appConfig) {
        
        // Local variables
        var vm = this;
        var adminStatuses = [
            "on process", "transferred", "paid", "on delivery", "received", "cancelled"
        ]
        var supplierStatus = ["paid", "on delivery", "cancelled"];
        
        // Data
        vm.data = {};
        vm.orderId = $stateParams.id;
        vm.orderTitle = '';
        vm.taToolbar = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'html', 'insertImage', 'insertLink', 'insertVideo']//, 'wordcount', 'charcount']
        ];
        vm.Auth = Auth;
        vm.statuses = [];
        vm.loading = false;
        
        // Methods
        vm.goBack = goBack;
        vm.saveData = saveData;

        //////////

        init();

        function init() {
            vm.statuses = adminStatuses;

            if (vm.orderId) {
                $http.get('/api/orders/' + vm.orderId)
                    .then((response) => {
                        vm.data = response.data;
                        console.log(vm.data);

                    })
                    .catch((err) => {
                        toastr.error(err.data, 'ERROR');
                    }) 
            }
        }

        function goBack() {
            $state.go('app.orders');
        }
        
        /**
         * Save Data
         */
        function saveData(data) {
            console.log(data);
            
            var query = {
                url: '/api/orders/' + vm.orderId,
                //arrayKey: '',
                method: 'PUT',
                data: {
                    status: data.status,
                    messages: data.messages
                }
            };
            vm.loading = true;

            $http(query)
                .then((response) => {
                    console.log(response);
                    toastr.success('Order updated', 'Success');

                    vm.loading = false;
                    $state.go('app.orders');
                })
                .catch((err) => {
                    vm.loading = false;
                    console.error(err);
                    toastr.error(err.data, 'Error');
                })
        }

    }

    angular
        .module('app.ecommerce')
        .controller('OrderController', OrderController);

})();
