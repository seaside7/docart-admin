(function () {

    'use strict';

    function ProductController($scope, $state, $stateParams, $http, $document, toastr, Upload) {
        var vm = this;

        // Data
        vm.data = {};
        vm.productId = $stateParams.id;
        vm.productTitle = 'New Product';
        vm.taToolbar = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        ];

        
        // Methods
        vm.goBack = goBack;
        vm.onCategoriesSelectorOpen = onCategoriesSelectorOpen;
        vm.onCategoriesSelectorClose = onCategoriesSelectorClose;
        vm.saveData = saveData;

        //////////

        loadCategories();
        init();

        function init() {
            if (vm.productId) {
                $http.get('/api/products/' + vm.productId)
                    .then((response) => {
                        console.log(response);
                        vm.data = response.data;
                    })
                    .catch((err) => {
                        toastr.error(err.data, 'ERROR');
                    }) 
            }

            // Set the tags other than undefined so we dont have a md-chips complaint
            if (!vm.data.tags) {
                vm.data.tags = [];
            } 

            // Update finalPrice upon discount and price changes
            $scope.$watchGroup(['vm.data.price', 'vm.data.discount'], () => {
                var price = +vm.data.price;
                var disc = +vm.data.discount;
                vm.data.finalPrice = price - ((price * disc) / 100);
            });
        }

        function loadCategories() {
            $http.get('/api/categories/all')
                .then((response) => {
                    console.log(response.data)
                    var categories = response.data;
                    
                    // Sort out categories
                    vm.categories = [];
                    categories.forEach((cat) => {
                        vm.categories.push(cat);
                        cat.parent = true;
                        if (cat.children.length > 0) {
                            cat.children.forEach((child) => {
                                vm.categories.push(child);
                                child.parent = false;
                                delete child.children;
                            });
                        }
                        delete cat.children;
                    });
                })            
                .catch((err) => {
                    console.error(err);
                })
        }


        function goBack() {
            $state.go('app.products');
        }

        /**
         * On categories selector open
         */
        function onCategoriesSelectorOpen()
        {
            // The md-select directive eats keydown events for some quick select
            // logic. Since we have a search input here, we don't need that logic.
            $document.find('md-select-header input[type="search"]').on('keydown', function (e)
            {
                e.stopPropagation();
            });
        }

        /**
         * On categories selector close
         */
        function onCategoriesSelectorClose()
        {
            // Clear the filter
            vm.categoriesSelectFilter = '';

            // Unbind the input event
            $document.find('md-select-header input[type="search"]').unbind('keydown');
        }

        
        /**
         * Save Data
         */
        function saveData() {
            console.log(vm.data);

            var query = {
                url: '/api/products',
                data: vm.data
            };

            if (vm.productId) {
                query.url = '/api/products/' + vm.productId;
                query.method = 'PUT';
            }

            Upload.upload(query).then((response) => {
                console.log(response);
                toastr.success('Category created', 'Success');
                init();
            })
            .catch((err) => {
                console.error(err);
                toastr.error(err.data, 'Error');
            })
        }

    }

    angular
        .module('app.ecommerce')
        .controller('ProductController', ProductController);

})();
