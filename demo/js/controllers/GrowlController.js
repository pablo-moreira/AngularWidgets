(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('GrowlController', ['$wgGrowl', GrowlController]);

	function GrowlController($wgGrowl) {
		
		var vm = this;
		      
		vm.showInfoGrowl = function() {
			$wgGrowl.showInfoMessage('Info message title', "Info detail message");
		};
		
		vm.showErrorGrowl = function() {
			$wgGrowl.showErrorMessage('Error message title', "Error detail message");
		};
		
		vm.showWarnGrowl = function() {
			$wgGrowl.showWarnMessage('Warn message title', "Warn detail message");
		};
		
		vm.showStickyMessage = function() {
			$wgGrowl.showInfoMessage('Message', "Message with options sticky = true, message remains until close icon clicked", { sticky: true });
		};
		
		vm.showLife500Message = function() {
			$wgGrowl.showInfoMessage('Message', "Message with options life 500 ms", { life: 500 } );
		}

		vm.showLife6000Message = function() {
			$wgGrowl.showInfoMessage('Message', "Message with options life 6000 ms", { life: 6000 } );
		}
		
		vm.clearMessages = function() {
			$wgGrowl.clearMessages();
		}
	};

}(window, document));