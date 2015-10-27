(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('FieldsetController', [ '$wgGrowl', FieldsetController ]);

	function FieldsetController($wgGrowl) {
   		
		var vm = this;
		
		vm.bind;

        vm.onToggle = function (evt, fieldset) {
        	$wgGrowl.showInfoMessage('Message', 'User toggled the fieldset to ' + (fieldset.isCollapsed() ? 'collapse' : 'expand') + '!');
        };

        vm.fieldsetName = 'Change me';
    };

}(window, document));