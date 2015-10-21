(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('GrowlController', ['$puiGrowl', GrowlController]);

	function GrowlController($puiGrowl) {
		
		var vm = this;
		      
		vm.showInfoGrowl = function() {
			$puiGrowl.showInfoMessage('Info message title', "Info detail message");
		};
		
		vm.showErrorGrowl = function() {
			$puiGrowl.showErrorMessage('Error message title', "Error detail message");
		};
		
		vm.showWarnGrowl = function() {
			$puiGrowl.showWarnMessage('Warn message title', "Warn detail message");
		};
		
		vm.showStickyMessage = function() {
			$puiGrowl.showInfoMessage('Message', "Message with options sticky = true, message remains until close icon clicked", { sticky: true });
		};
		
		vm.showLife500Message = function() {
			$puiGrowl.showInfoMessage('Message', "Message with options life 500 ms", { life: 500 } );
		}

		vm.showLife6000Message = function() {
			$puiGrowl.showInfoMessage('Message', "Message with options life 6000 ms", { life: 6000 } );
		}
		
		vm.clearMessages = function() {
			$puiGrowl.clearMessages();
		}
	};

}(window, document));