(function () {

    'use strict';

    function CategoriesController($http) {
        var vm = this;
        var started = false;
    
        // Data
        vm.limitOptions = [5, 10, 25, 50, 100];
        vm.totalData = 0;
        vm.query = {
            order: 'name', limit: 25, page: 1, search: '', sort: ''
        };

        // Methods
        vm.reloadData = reloadData;
        vm.editData = editData;
        vm.deleteData = deleteData;
        vm.onPaginate = onPaginate;
        vm.onReorder = onReorder;
        
        // reload at startup
        reloadData();
        
        var searchBox = angular.element('body').find('#e-commerce-categories-search');

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

        /**
         * reloadData
         */
        function reloadData() {
            $http({
                method: 'GET', 
                url: '/api/categories', 
                params: { offset: (vm.query.page - 1) * vm.query.limit, limit: vm.query.limit, search: vm.query.search, sort: vm.query.sort }
            })
                .then(function(response) {
                    console.log(response.data);

                    vm.categories = response.data.docs;
                    vm.totalData = response.data.total;
                })
        }

        
        /**
         * editData
         * 
         * @param {Category} data
         */
        function editData(data) {
            console.log(data);
        }

        /**
         * Delete data
         * 
         * @param {Category} data
         */
        function deleteData(data) {
            console.log(data);
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
        .module('app.categories')
        .controller('CategoriesController', CategoriesController);

})();
