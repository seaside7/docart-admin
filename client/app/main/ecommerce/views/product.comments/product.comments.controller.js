(function () {

    'use strict';

    function ProductCommentsController($state, $http, $stateParams, $mdDialog, toastr, Auth) {
        var vm = this;

        // Data
        vm.productId = $stateParams.id;
        vm.Auth = Auth;
        vm.limitOptions = [5, 10, 25, 50, 100];
        vm.totalData = 0;
        vm.query = {
            order: 'title', limit: 25, page: 1, search: '', sort: 'title'
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
            reloadData();

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
        function reloadData() {
            $http({
                method: 'GET',
                url: '/api/products/'+ vm.productId
            })
                .then(function (response) {
                    vm.product = response.data;
                    
                    $http({
                        method: 'GET', url: '/api/products/comments/' + vm.productId
                    })
                        .then(response => {
                            vm.comments = response.data.docs;
                            console.log(vm.comments);
                        })
                        .catch(err => {
                            toastr.error(err.data, 'Error');
                            $state.go('app.products');
                        })
                })
                .catch(err => {
                    toastr.error(err.data, 'Error');
                    $state.go('app.products');
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
                    .textContent('Are you sure you want to delete ' + data.title + '?')
                    .ariaLabel('Delete')
                    .ok('Yes')
                    .cancel('No');

            $mdDialog.show(confirm).then(function () {
                
                $http.delete('/api/products/comments/' + data._id)
                    .then((response) => {
                        console.log(response);
                        toastr.success('Comment deleted', 'Success');
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
        .controller('ProductCommentsController', ProductCommentsController);

})();
