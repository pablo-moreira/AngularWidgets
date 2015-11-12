(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('DatalistController', ['$wgGrowl', DatalistController]);

	function DatalistController($wgGrowl) {      
		
		var vm = this;

		vm.emptyData = [];
		
		vm.countries = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antarctica', 'Antigua and Barbuda', 'Argentina', 'Armenia',
            'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil'];
		
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

		vm.onItemSelect = function(data) {
			$wgGrowl.showInfoMessage('Item selection', 'Selected a ' + data.color + ' ' + data.brand + ' of ' + data.year + ' (id = ' + data.vin + ')');
		};

		vm.onItemUnselect = function(data) {
			
			if (angular.isArray(data)) {
				data = data[0];
			}

			$wgGrowl.showInfoMessage('Item deselection', 'deselected the ' + data.color + ' ' + data.brand + ' of ' + data.year + ' (id = ' + data.vin + ')');
		};   
	 
		// HttpDataSource
		vm.httpDataSource = new AngularWidgets.FakeHttpDataSource({ url: 'json/cars.json' });
			
		// Restriction
		vm.datalist = null;
		
 		vm.simpleRestriction = new AngularWidgets.Restriction([
 			{ attribute: "year", value: 1998, operator: "GE" },
 			"color", 
 			{ attribute: "brand", operator: "START_WITH"} 			
 		]);
	}

}(window, document));