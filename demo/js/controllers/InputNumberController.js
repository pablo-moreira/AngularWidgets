(function (window, document, undefined) {
    
    "use strict";

    angular.module('demo').controller('InputNumberController', [ InputNumberController ]);

    function InputNumberController() {

        var vm = this;
        
        vm.integer = 1000000;
        vm.float = 1350.25;
        vm.percent = 6.38;
        vm.currency = 3567.25;

        vm.fieldDisabled = true;
        
        vm.enableField = function() {
            vm.fieldDisabled = false;
        };

        vm.disableField = function() {
            vm.fieldDisabled =  true;
        };
    
        vm.fieldVisible = false;
    
        vm.showField = function() {
            vm.fieldVisible = true;
        };
    
        vm.hideField = function() {
            vm.fieldVisible =  false;
        };
    }

}(window, document));