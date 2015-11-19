(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('PanelController', [ '$wgGrowl', PanelController ]);

	function PanelController($wgGrowl) {
		
		var vm = this;
		
		vm.panel = null;
		
		vm.panelTitle = "Change me";

		vm.onToggle = function (panel) {
	    	$wgGrowl.showInfoMessage('Message', 'User toggled the panel to ' + (panel.isCollapsed() ? 'collapse' : 'expand') + '!');
		};

		vm.onClose = function(panel) {
			$wgGrowl.showInfoMessage('Message', 'User closed the panel');
		};
	}

}(window, document));