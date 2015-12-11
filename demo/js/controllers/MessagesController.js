(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('MessagesController', ['$wgMessages', MessagesController]);

	function MessagesController($wgMessages) {
		
		var vm = this;
		      
		vm.showInfoGrowl = function() {
			$wgMessages.showInfoMessage('Info message summary', "Info detail message");
		};
		
		vm.showErrorGrowl = function() {
			$wgMessages.showErrorMessage('Error message summary', "Error detail message");
		};
		
		vm.showWarnGrowl = function() {
			$wgMessages.showWarnMessage('Warn message summary', "Warn detail message");
		};
		
		vm.clearMessages = function() {
			$wgMessages.clearMessages();
		};
	};

}(window, document));