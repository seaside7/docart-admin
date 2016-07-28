(function () {

    'use strict';

    function SubCategoriesController($http, $mdDialog, $state, $stateParams, $document, toastr) {
        var vm = this;
        var started = false; 
    
        // Data
        vm.limitOptions = [5, 10, 25, 50, 100];
        vm.totalData = 0;
        vm.query = {
            order: 'name', limit: 25, page: 1, search: '', sort: ''
        };
        vm.productId = $stateParams.id;

        // Methods
        vm.reloadData = reloadData;
        vm.createData = createData;
        vm.editData = editData;
        vm.deleteData = deleteData;
        vm.onPaginate = onPaginate;
        vm.onReorder = onReorder;
        vm.gotoCategories = gotoCategories;

        //////////

        init();

        function init() {
            // reload at startup
            
            var searchBox = angular.element('body').find('#e-commerce-subcategories-search');
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

            $http.get('/api/categories/' + vm.productId)
                .then((response) => {
                    console.log(response); 
                    vm.product = response.data;
                    reloadData();          
                })
                .catch((err) => {
                    toastr.warning("Sub categories not found", 'Warning'); 
                });
        }

        /**
         * reloadData
         */
        function reloadData() {
            $http({
                method: 'GET', 
                url: '/api/categories/subs/' + vm.productId, 
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
                controller:             'SubCategoryFormDialogController',
                controllerAs:           'vm',
                templateUrl:            'app/main/ecommerce/views/categories/dialogs/category-form-dialog.html',
                parent:                 angular.element($document.body),
                clickOutsideToClose:    true,
                locals:                 {
                    dialogData: {
                        type:           "create",
                        categoryId:     vm.productId,
                        data:           {}
                    }
                }
            })
                .then((data) => {
                    console.log(data);
                    if (data.active === undefined) {
                        data.active = false;
                    }

                    $http.post("/api/categories/subs/" + vm.productId, data) 
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
                    $http.put('/api/categories/'+ data._id , data) 
                        .then((response) => {
                            console.log(response);
                            reloadData();
                            toastr.success('Category updated', 'Success');
                        })
                        .catch((err) => {
                            console.error(err);
                            toastr.error(err.data, 'Error');
                        });
                })
        }

        /**
         * Delete data
         * 
         * @param {Category} data
         */
        function deleteData(data) {
            var confirm = $mdDialog.confirm()
                .title('Delete')
                .textContent('Are you sure you want to delete the category?')
                .ariaLabel('Lucky day')
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function() {
                $http.delete("/api/categories/" + data._id)
                    .then(() => {
                        reloadData();
                        toastr.warning("Category deleted", 'Delete');
                    })
                    .catch((err) => {
                        console.error(err);
                        toastr.error(err.data, 'Error');
                    })
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

        function gotoCategories() {
            $state.go('app.categories');
        }
    }

    angular
        .module('app.ecommerce')
        .controller('SubCategoriesController', SubCategoriesController);

})();
