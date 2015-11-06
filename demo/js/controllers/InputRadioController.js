(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('InputRadioController', ['$wgGrowl', InputRadioController]);

	function InputRadioController($wgGrowl) {
   		
		var vm = this;

		vm.mega = 'Mega';
		vm.console = vm.mega;			
		vm.consoleOptions = ['Xbox One', 'PS4', 'Wii U'];
		
		vm.cityOptions = [
			{ id: 1, name: 'Miami', country: 'US'},
			{ id: 2, name: 'Brasilia', country: 'BR'},
			{ id: 3, name: 'Porto Velho', country: 'BR'},
			{ id: 4, name: 'London', country: 'UK'},
			{ id: 5, name: 'Paris', country: 'FR'},			
		];

		vm.city = null;
    }

}(window, document));