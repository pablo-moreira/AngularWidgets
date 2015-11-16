(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('InputCheckboxController', ['$wgGrowl', InputCheckboxController]);

	function InputCheckboxController($wgGrowl) {
   		
		var vm = this;

		vm.javascript = true;
		vm.angularjs = undefined;
		vm.angularWidgets = false;

		vm.onChange = function(checkbox, checked) {
			$wgGrowl.showInfoMessage('Checkbox', 'The checkbox value is: '  + (checked ? 'true' : 'false'));
		};
		
		vm.checkboxDisabled = true;
    }

}(window, document));
