(function () {

    'use strict';

    function CustomersController($http, $state, $mdDialog, $document, toastr, Upload, msNavigationService, Auth) {
        var vm = this;
        var started = false;

        // Data
        vm.limitOptions = [5, 10, 25, 50, 100];
        vm.totalData = 0;
        vm.query = {
            order: 'name', limit: 25, page: 1, search: '', sort: 'name'
        };

        // Methods
        vm.reloadData = reloadData;
        vm.createData = createData;
        vm.editData = editData;
        vm.deleteData = deleteData;
        vm.onPaginate = onPaginate;
        vm.onReorder = onReorder;

        //////////

        init();

        function init() {
            // reload at startup
            reloadData();

            var searchBox = angular.element('body').find('#user-search');

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
        function reloadData() {
            $http({
                method: 'GET',
                url: '/api/users/customers',
                params: { offset: (vm.query.page - 1) * vm.query.limit, limit: vm.query.limit, search: vm.query.search, sort: vm.query.sort }
            })
                .then(function (response) {
                    console.log(response.data);
                    vm.customers = response.data.docs;
                    vm.totalData = response.data.total;
                })
        }


        /**
         * Create Customer
         *
         */
        function createData() {
            $state.go('app.new_customer');
        }

        /**
         * editData
         * 
         * @param {Customer} data
         */
        function editData(data) {
            $state.go('app.customer_profile', { id: data._id });
        }

        /**
         * Delete data
         * 
         * @param {Customer} data
         */
        function deleteData(data) {
            console.log(data);
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .textContent('Are you sure you want to delete customer ' + data.name + '?')
                .ariaLabel('Delete')
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function () {

                $http.delete('/api/users/' + data._id)
                    .then((response) => {
                        console.log(response);
                        toastr.success('User deleted', 'Success');
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
        .module('app.customers')
        .controller('CustomersController', CustomersController);

})();
