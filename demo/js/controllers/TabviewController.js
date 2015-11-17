(function (window, document, undefined) {	
	"use strict";

	angular.module('demo').controller('TabviewController', [ '$wgGrowl', TabviewController ]);

	function TabviewController($wgGrowl) {
   		
		var vm = this;

		vm.onShowTab1 = function(accordion) {
			$wgGrowl.showInfoMessage('Info', 'Show tab1!!!');
		}
		
		vm.title1 = 'title1';
		vm.description1 = 'description1';
		vm.title2 = 'title2';
		vm.description2 = 'description2';

		vm.onTabChange = function(tabView, index) {
			$wgGrowl.showInfoMessage('Info', 'Tab with index '+ index + ' selected');
		};
		
		vm.onTabClose = function(tabView, index) {
			$wgGrowl.showInfoMessage('Info', 'Tab with index ' + index + ' closed - Tabs remains: ' + tabView.getLength());
		};
		
		vm.tabViewBind = null;
		vm.activeIndex = 1;     

		vm.includeList = ["partials/tabview/include/panel1.html","partials/tabview/include/panel2.html"];

		vm.distributedData = {
			field1: "field1"
			, field2: "field2"
			, field3: "field3"
		};

		vm.addPanel = function() {
			vm.includeList.push("partials/tabview/include/panel3.html");
		}
    };

}(window, document));