(function () {

    'use strict';

    function CategoriesController($http, $state, $mdDialog, $document, toastr, Upload) {
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
        vm.gotoSubCategories = gotoSubCategories;
        
        //////////

        init();

        function init() {
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
        }

        /**
         * reloadData
         */
        function reloadData() {
            $http({
                method: 'GET', 
                url: '/api/categories/main', 
                params: { offset: (vm.query.page - 1) * vm.query.limit, limit: vm.query.limit, search: vm.query.search, sort: vm.query.sort }
            })
                .then(function(response) {
                    console.log(response.data);

                    vm.categories = response.data.docs;
                    vm.totalData = response.data.total;
                })
        }


        /**
         * Create category
         *
         * @param {any} ev 
         */
        function createData() {
            $mdDialog.show({
                controller:             'CategoryFormDialogController',
                controllerAs:           'vm',
                templateUrl:            'app/main/ecommerce/views/categories/dialogs/category-form-dialog.html',
                parent:                 angular.element($document.body),
                clickOutsideToClose:    true,
                locals:                 {
                    dialogData: {
                        type:           "create",
                        data:           {}
                    }
                }
            })
                .then((data) => {
                    console.log(data);
                    if (data.active === undefined) {
                        data.active = false;
                    }

                    Upload.upload({
                        url: '/api/categories',
                        data: data
                    })
                        .then((response) => {
                            console.log(response);
                            reloadData();
                            toastr.success('Category created', 'Success');
                        })
                        .catch((err) => {
                            console.error(err);
                            toastr.error(err.data, 'Error');
                        })
                })
        }
        
        /**
         * editData
         * 
         * @param {Category} data
         */
        function editData(data) {
            $mdDialog.show({
                controller:             'CategoryFormDialogController',
                controllerAs:           'vm',
                templateUrl:            'app/main/ecommerce/views/categories/dialogs/category-form-dialog.html',
                parent:                 angular.element($document.body),
                clickOutsideToClose:    true,
                locals:                 {
                    dialogData: {
                        type:           "edit",
                        data:           angular.copy(data)
                    }
                }
            })
                .then((data) => {
                    console.log(data);
                    Upload.upload({
                        url: '/api/categories/' + data._id,
                        data: data,
                        method: 'PUT'
                    })
                        .then((response) => {
                            console.log(response);
                            reloadData();
                            toastr.success('Category created', 'Success');
                        })
                        .catch((err) => {
                            console.error(err);
                            toastr.error(err.data, 'Error');
                        })
                })
        }

        /**
         * Delete data
         * 
         * @param {Category} data
         */
        function deleteData(data) {
            if (data.children.length > 0) {
                $mdDialog.show($mdDialog.alert()
                    .title(`Warning`)
                    .clickOutsideToClose(true)
                    .textContent(`You can only delete blank category`)
                    .ariaLabel('Warning')
                    .ok('OK'));
            }
            else {
                var confirm = $mdDialog.confirm()
                    .title('Delete')
                    .textContent('Are you sure you want to delete category ' + data.name + '?')
                    .ariaLabel('Delete')
                    .ok('Yes')
                    .cancel('No');

                $mdDialog.show(confirm).then(function() {
                    $http.delete("/api/categories/" + data._id)
                        .then(() => {
                            reloadData();
                            toastr.success("Category deleted", 'Delete');
                        })
                        .catch((err) => {
                            console.error(err);
                            toastr.error(err.data, 'Error');
                        })
                });
            }
        }

        /**
         * Got to sub categories page
         * 
         * @param {Category} category
         */
        function gotoSubCategories(category) {
            console.log("goto sub category");
            $state.go('app.subcategories', { id: category._id });
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
        .controller('CategoriesController', CategoriesController);

})();
