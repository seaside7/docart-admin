(function () {

    'use strict';

    function CategoriesController() {
        var vm = this;

        // Data
        //vm.categories = Categories;

        //console.log(vm.categories);
/*
        vm.dtInstance = {};
        vm.dtOptions = {
            dom: 'rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
            columnDefs: [
                {
                    // Target the id column
                    targets: 0,
                    width: '72px'
                },
                {
                    // Target the image column
                    targets: 2,
                    filterable: false,
                    sortable: false,
                    width: '80px'
                },
                {
                    // Target the status column
                    targets: 3,
                    filterable: false,
                    render: function (data, type) {
                        if (type === 'display') {
                            if (data === 'true') {
                                return '<i class="icon-checkbox-marked-circle green-500-fg"></i>';
                            }

                            return '<i class="icon-cancel red-400-fg"></i>';
                        }

                        if (type === 'filter') {
                            if (data) {
                                return '1';
                            }

                            return '0';
                        }

                        return data;
                    }
                },
                {
                    // Target the actions column
                    targets: 4,
                    responsivePriority: 1,
                    filterable: false,
                    sortable: false
                }
            ],
            initComplete: function () {
                var api = this.api(),
                    searchBox = angular.element('body').find('#e-commerce-products-search');

                // Bind an external input as a table wide search box
                if (searchBox.length > 0) {
                    searchBox.on('keyup', function (event) {
                        api.search(event.target.value).draw();
                    });
                }
            },
            pagingType: 'full_numbers', 
            lengthMenu: [10, 20, 30, 50, 100],
            pageLength: 20,
            scrollY: 'auto',
            responsive: true,
            serverSide: true,
            dataProp: 'data'
        };
*/
        // Methods
        
    }

    angular
        .module('app.categories')
        .controller('CategoriesController', CategoriesController);

})();
