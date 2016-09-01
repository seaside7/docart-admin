(function () {

    'use strict';

    function ProductController($scope, $state, $stateParams, $http, $document, toastr, Upload, Auth, appConfig) {
        var vm = this;

        // Data
        vm.data = {};
        vm.productUnits = appConfig.productUnits;
        vm.productId = $stateParams.id;
        vm.productTitle = 'New Product';
        vm.taToolbar = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        ];
        vm.Auth = Auth;
        vm.mainCategories = [];
        vm.subCategories = [];
        
        // Methods
        vm.goBack = goBack;
        vm.saveData = saveData;
        vm.setDefaultImage = setDefaultImage;
        vm.deleteImage = deleteImage;

        //////////

        loadCategories();
        init();

        function init() {
            if (vm.productId) {
                $http.get('/api/products/' + vm.productId)
                    .then((response) => {
                        vm.data = response.data;
                        vm.productTitle = vm.data.name.toUpperCase();
                        console.log(vm.data);

                        if (vm.data.category) {
                            vm.mainCategories.forEach((mc) => {
                                if (mc._id === vm.data.category.parent) {
                                    vm.subCategories = mc.children;
                                }
                            })
                            vm.data.category = vm.data.category._id;
                        }
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

            $scope.$watch('vm.data.images', (newVal, oldVal) => {
                console.log(newVal);
            })

        }

        function loadCategories() {
            $http.get('/api/categories/all')
                .then((response) => {
                    vm.mainCategories = response.data;
                })            
                .catch((err) => {
                    console.error(err);
                    toastr.error('Can not load categories, please refresh', 'ERROR');
                })
        }

        function goBack() {
            $state.go('app.products');
        }

        
        /**
         * Save Data
         */
        function saveData() {
            console.log(vm.data);

            var query = {
                url: '/api/products',
                arrayKey: '',
                data: vm.data
            };

            if (vm.productId) {
                query.url = '/api/products/' + vm.productId;
                query.method = 'PUT';
            }

            Upload.upload(query)
            .then((response) => {
                console.log(response);
                toastr.success('Product saved', 'Success');
                if (vm.productId) {
                    init();
                }
                else {
                    $state.go('app.products');
                }
            })
            .catch((err) => {
                console.error(err);
                toastr.error(err.data, 'Error');
            })
        }

        function setDefaultImage(defaultImage) {
            $http({
                url: "/api/products/image/" + vm.productId + "/default",
                method: 'PUT',
                data: {
                    defaultImage: defaultImage
                }
            })
            .then((response) => {
                console.log(response);
                toastr.success('Default image changed', 'Success');
                if (vm.productId) {
                    init();
                }
            })
            .catch((err) => {
                console.error(err);
                toastr.error(err.data, 'Error');
            })
        }

        function deleteImage(deleteImage, index) {
            console.log(index);
            $http({
                url: "/api/products/image/" + vm.productId,
                method: 'POST',
                data: {
                    deleteIndex: index
                }
            })
            .then((response) => {
                console.log(response);
                toastr.success('Image deleted', 'Success');
                if (vm.productId) {
                    init();
                }
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
