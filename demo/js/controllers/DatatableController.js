(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('DatatableController', ['$http', '$wgGrowl', DatatableController]);

	function DatatableController($http, $wgGrowl) {      
		
		var vm = this;
		
		// Common		
		vm.fixedData = [
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

		vm.onRowSelect = function(event, data) {
			$wgGrowl.showInfoMessage('Row selection', 'Selected a ' + data.color + ' ' + data.brand + ' of ' + data.year + ' (id = ' + data.vin + ')');
		};

		vm.onRowUnselect = function(event, data) {
			if (data) {
				$wgGrowl.showInfoMessage('Row deselection', 'deselected the ' + data.color + ' ' + data.brand + ' of ' + data.year + ' (id = ' + data.vin + ')');
			}
		};

		vm.showInfo = function (car) {
			$wgGrowl.showInfoMessage('Car Information', 'Car Vin: ' + car.vin + ' Brand: ' + car.brand );
		};

		// Prog Pagination
		vm.progPaginationBind = null;
		vm.progPaginationPage = 0;        
	 
		// HttpDataSource
		vm.httpDataSource = new AngularWidgets.FakeHttpDataSource({ url: 'json/cars.json' });
	}

}(window, document));