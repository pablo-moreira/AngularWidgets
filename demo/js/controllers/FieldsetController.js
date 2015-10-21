(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('FieldsetController', [ '$puiGrowl', FieldsetController ]);

	function FieldsetController($puiGrowl) {
   		
		var vm = this;
		
		vm.bind;

        vm.onToggle = function (evt, fieldset) {
        	$puiGrowl.showInfoMessage('Message', 'User toggled the fieldset to ' + (fieldset.isCollapsed() ? 'collapse' : 'expand') + '!');
        };

        vm.fieldsetName = 'Change me';
    };

}(window, document));