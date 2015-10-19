(function (window, document, undefined) {
    
    "use strict";

    angular.module('demo').controller('InputNumberController', [ InputNumberController ]);

    function InputNumberController() {

        var vm = this;
        
        vm.integer = 350;
        vm.thousands = 1000.00;
        vm.decimal = 150.35;        

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