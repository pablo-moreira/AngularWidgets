(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('MessagesController', ['$wgMessages', MessagesController]);

	function MessagesController($wgMessages) {
		
		var vm = this;
		
		vm.addInfoMessage = function() {
			$wgMessages.addInfoMessage('Info message summary', "Info detail message");
		};

		vm.addWarnMessage = function() {
			$wgMessages.addWarnMessage('Warn message summary', "Warn detail message");
		};

		vm.addErrorMessage = function() {
			$wgMessages.addErrorMessage('Error message summary', "Error detail message");
		};

		vm.showInfoMessage = function() {
			$wgMessages.showInfoMessage('Info message summary', "Info detail message");
		};
		
		vm.showErrorMessage = function() {
			$wgMessages.showErrorMessage('Error message summary', "Error detail message");
		};
		
		vm.showWarnMessage = function() {
			$wgMessages.showWarnMessage('Warn message summary', "Warn detail message");
		};

		vm.showMultipleMessages = function() {

			var msgs = [
				{ severity: 'info', summary: 'Info message summary', detail: "Info detail message" },
				{ severity: 'warn', summary: 'Warn message summary', detail: "Warn detail message" },
				{ severity: 'error', summary: 'Error message summary', detail: "Error detail message" }
			];

			$wgMessages.showMessages(msgs);
		};
		
		vm.clearMessages = function() {
			$wgMessages.clearMessages();
		};
	};

}(window, document));