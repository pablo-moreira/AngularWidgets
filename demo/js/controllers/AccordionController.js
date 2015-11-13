(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('AccordionController', [ '$wgGrowl', AccordionController ]);

	function AccordionController($wgGrowl) {
   		
		var vm = this;

		vm.onShowTab1 = function(accordion) {
			$wgGrowl.showInfoMessage('Info', 'Show tab1!!!');
		}
		
		vm.onHideTab1 = function(accordion) {
			$wgGrowl.showInfoMessage('Info', 'Hide tab1!!!');
		}

		vm.onTabShow = function(accordion, tabIndex) {
			$wgGrowl.showInfoMessage('Info', 'Show tab: ' + tabIndex + '!!!');
		}

		vm.onTabHide = function(accordion, tabIndex) {
			$wgGrowl.showInfoMessage('Info', 'Hide tab: ' + tabIndex + '!!!');
		}
    };

}(window, document));