(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('DialogController', [ '$puiGrowl', '$puiDialog', function DialogController(puiGrowl, $puiDialog) {
   		
		var vm = this;
   		
        vm.car = null;
                
		vm.cars = [
           {'brand':'Volkswagen','year': 2012, 'color':'White', 'vin':'dsad231ff'},
           {'brand':'Audi','year': 2011, 'color':'Black', 'vin':'gwregre345'},
           {'brand':'Renault','year': 2005, 'color':'Gray', 'vin':'h354htr'},
           {'brand':'Bmw','year': 2003, 'color':'Blue', 'vin':'j6w54qgh'},
           {'brand':'Mercedes','year': 1995, 'color':'White', 'vin':'hrtwy34'},
           {'brand':'Opel','year': 2005, 'color':'Black', 'vin':'jejtyj'},
           {'brand':'Honda','year': 2012, 'color':'Yellow', 'vin':'g43gr'},
           {'brand':'Chevrolet','year': 2013, 'color':'White', 'vin':'greg34'},
           {'brand':'Opel','year': 2000, 'color':'Black', 'vin':'h54hw5'},
           {'brand':'Mazda','year': 2013, 'color':'Red', 'vin':'245t2s'}
		];

		vm.title = "Godfather I";
		vm.dialog = null;

		vm.confirmDialog = null;

		vm.yesAction = function() {
			puiGrowl.showInfoMessage('World destroyed!', 'Error...');
		};
		
		vm.noAction = function() {
			puiGrowl.showInfoMessage('World not destroyed!', 'Ops...');
		};

		vm.dismissAction = function() {
			puiGrowl.showInfoMessage('Dismiss!', 'Ops...');
		};

		vm.showConfirmDialog = function() {
			$puiDialog.showConfirmDialog('Destroy the World', 'Are you sure?')
			.onYes(function(){
				puiGrowl.showInfoMessage('World destroyed!', 'Error...');
			})
			.onNo(function(){
				puiGrowl.showInfoMessage('World not destroyed!', 'Ops...');
			})
			.onDismiss(function() {
				puiGrowl.showInfoMessage('Dismiss!', 'Ops...');
			});
		}			
    }]);

}(window, document));