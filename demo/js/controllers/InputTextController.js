(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('InputTextController', ['$wgGrowl', InputTextController]);

	function InputTextController() {
   		
    	var vm = this;
    	
    	vm.value1 = 'Change me';

		vm.numbers = 123;

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
