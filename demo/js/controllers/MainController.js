(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('MainController', [ '$location', '$rootScope', 'widgets', 'version', MainController ]);

	function MainController($location, $rootScope, widgets, version) {
   		
		var vm = this;

    	vm.widgets = widgets;
        vm.version = version;
        vm.angularVersion = angular.version;
                
    	var url = $location.absUrl();

		vm.widget = null;
	    	    	
		for (var i=0, t=vm.widgets.length; i<t; i++) {
			    		
			for (var j=0, l=vm.widgets[i].subPages.length; j<l; j++) {    			
				
				var pg = vm.widgets[i].subPages[j];
				
				if (url.indexOf(pg.path) != -1) {
					vm.widget = vm.widgets[i];
					vm.item = pg;
	    			break;	
				}
			}
			
			if (vm.widget) {
				break;
			}
		};
		
		vm.isSelected = function(item) {
			return vm.item === item;
		};
		
		vm.selectWidget = function(widget, item) {
			vm.widget = widget;
			vm.item = item;
		};
	}

}(window, document));