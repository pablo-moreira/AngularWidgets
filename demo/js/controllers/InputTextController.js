(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('InputTextController', ['$wgGrowl', InputTextController]);

	function InputTextController($wgGrowl) {
   		
    	var vm = this;
    	
    	vm.value = 'Change me';

		vm.fieldDisabled = true;

		vm.fieldVisible = false;

		vm.onEnterKey = function(inputText) {
			$wgGrowl.showInfoMessage('On enter key press!!!', 'InputText value is: ' + inputText.getValue());
		}
    }

}(window, document));
