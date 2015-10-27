(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('DialogController', ['$puiDialog', '$wgGrowl', DialogController]);

	function DialogController($puiDialog, $wgGrowl) {
   		
		var vm = this;

		vm.title = "Godfather I";
		vm.dialog = null;

		vm.confirmDialog = null;

		vm.yesAction = function() {
			$wgGrowl.showInfoMessage('World destroyed!', 'Error...');
		};
		
		vm.noAction = function() {
			$wgGrowl.showInfoMessage('World not destroyed!', 'Ops...');
		};

		vm.dismissAction = function() {
			$wgGrowl.showInfoMessage('Dismiss!', 'Ops...');
		};

		vm.showConfirmDialog = function() {
			$puiDialog.showConfirmDialog('Destroy the World', 'Are you sure?')
			.onYes(function(){
				$wgGrowl.showInfoMessage('World destroyed!', 'Error...');
			})
			.onNo(function(){
				$wgGrowl.showInfoMessage('World not destroyed!', 'Ops...');
			})
			.onDismiss(function() {
				$wgGrowl.showInfoMessage('Dismiss!', 'Ops...');
			});
		}			
    }

}(window, document));