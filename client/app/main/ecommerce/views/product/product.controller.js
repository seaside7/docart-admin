(function () {

    'use strict';

    function ProductController($state, $stateParams, $http) {
        var vm = this;

        // Data
        vm.productTitle = 'New Product';
        vm.froalaOptions = {
            toolbarButtons : ["bold", "italic", "underline", "|", "align", "formatOL", "formatUL"]
        }
        vm.taToolbar = [
            ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent', 'html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']
        ];
        
        // Methods
        vm.goBack = goBack;

        //////////

        init();

        function init() {

        }

        function goBack() {
            $state.go('app.products');
        }
    }

    angular
        .module('app.ecommerce')
        .controller('ProductController', ProductController);

})();
