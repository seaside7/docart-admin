(function () {

    'use strict';

    function SupplierInboxController($state, $stateParams, $http, $mdDialog, toastr, Auth) {
        var vm = this;

        // Data
        vm.back = $stateParams.back == 1;
        vm.supplierId = $stateParams.id;
        console.log(vm.back);

        vm.Auth = Auth;
        vm.limitOptions = [5, 10, 25, 50, 100];
        vm.totalData = 0;
        vm.query = {
            order: 'created_at', limit: 25, page: 1, search: '', sort: '-created_at'
        }; 

        // Methods
        vm.reloadData = reloadData;
        vm.deleteData = deleteData;
        vm.onPaginate = onPaginate;
        vm.onReorder = onReorder;

        //////////

        init();

        function init() {
            // reload at startup
            if (vm.supplierId) {
                reloadData(vm.supplierId);
            }
            else {
                Auth.getCurrentUser(user => {
                    reloadData(user._id);
                })
            }

            var searchBox = angular.element('body').find('#e-commerce-search');

            // Bind an external input as a table wide search box
            if (searchBox.length > 0) {
                searchBox.on('keyup', function (event) {
                    var term = event.target.value.trim();
                    if (vm.query.search !== term) {
                        vm.query.search = term;
                        vm.reloadData();
                    }
                });
            }
        }

        /**
         * reloadData
         */
        function reloadData(supplierId) {
            $http({
                method: 'GET',
                url: '/api/users/messages/' + supplierId,
                params: { offset: (vm.query.page - 1) * vm.query.limit, limit: vm.query.limit, search: vm.query.search, 
                    sort: vm.query.sort }
            })
                .then(function (response) {
                    console.log(response.data);
                    vm.messages = response.data.docs;
                    vm.totalData = response.data.total;
                })
        }

        /**
         * Delete data
         * 
         * @param {Supplier} data
         */
        function deleteData(data) {
            var confirm = $mdDialog.confirm()
                    .title('Delete')
                    .textContent('Are you sure you want to delete message ' + data.title + '?')
                    .ariaLabel('Delete')
                    .ok('Yes')
                    .cancel('No');

            $mdDialog.show(confirm).then(function () {
                
                $http.delete('/api/users/messages/' + data._id)
                    .then((response) => {
                        console.log(response);
                        toastr.success('Message deleted', 'Success');
                        reloadData();
                    })
                    .catch((err) => {
                        console.error(err);
                        toastr.error(err.data, 'Error');
                    });
            });
        }

        /**
         * Fired when user change page
         * 
         * @param {number} page
         * @param {number} limit
         */
        function onPaginate(page, limit) {
            vm.query.page = page;
            vm.query.limit = limit;
            reloadData();
        }

        /**
         * Fired when user re order column
         * 
         * @param {any} order
         */
        function onReorder(order) {
            console.log(order);
            vm.query.sort = order;
            reloadData();
        }
    }

    angular
        .module('app.ecommerce')
        .controller('SupplierInboxController', SupplierInboxController);

})();
