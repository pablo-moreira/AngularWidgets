(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('DialogController', ['$puiDialog', '$puiGrowl', DialogController]);

	function DialogController($puiDialog, $puiGrowl) {
   		
		var vm = this;

		vm.title = "Godfather I";
		vm.dialog = null;

		vm.confirmDialog = null;

		vm.yesAction = function() {
			$puiGrowl.showInfoMessage('World destroyed!', 'Error...');
		};
		
		vm.noAction = function() {
			$puiGrowl.showInfoMessage('World not destroyed!', 'Ops...');
		};

		vm.dismissAction = function() {
			$puiGrowl.showInfoMessage('Dismiss!', 'Ops...');
		};

		vm.showConfirmDialog = function() {
			$puiDialog.showConfirmDialog('Destroy the World', 'Are you sure?')
			.onYes(function(){
				$puiGrowl.showInfoMessage('World destroyed!', 'Error...');
			})
			.onNo(function(){
				$puiGrowl.showInfoMessage('World not destroyed!', 'Ops...');
			})
			.onDismiss(function() {
				$puiGrowl.showInfoMessage('Dismiss!', 'Ops...');
			});
		}			
    }

}(window, document));