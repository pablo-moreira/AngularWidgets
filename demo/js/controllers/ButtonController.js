(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('ButtonController', [ 'puiGrowl', ButtonController ]);

	function ButtonController($puiGrowl) {
   		
		var vm = this;
		      
		vm.showMessage = function(msg) {
			$puiGrowl.showInfoMessage('Message', msg);
		};

        vm.buttonDisabled = true;

        vm.enableButton = function() {
            vm.buttonDisabled = false;
        };

        vm.disableButton = function() {
            vm.buttonDisabled =  true;
        };

        vm.buttonTitle = 'Change me';

        vm.buttonVisible = false;

        vm.showButton = function() {
            vm.buttonVisible = true;
        };

        vm.hideButton = function() {
            vm.buttonVisible =  false;
        };
    };

}(window, document));