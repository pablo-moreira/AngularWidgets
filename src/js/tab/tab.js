(function(window, document, undefined) {
    "use strict";

    angular.module('angularWidgets').factory('widgetTab', function() {
    	
    	var widget = {}
    	
    	widget.determineOptions = function(container) {
    		
    		var puiTabs = angular.element(container).findAllSelector('wg-tab'),
            	tabs = [];
            
            angular.forEach(puiTabs, function(puiTab) {
            	this.push(angular.element(puiTab).data('options'));
            }, tabs);
            
            puiTabs.remove();

            return tabs;
    	}
    	
    	return widget;
    })
    .directive('wgTab', function () {
        return {
            restrict: 'E',
            priority: 1000,
            transclude: true,
            link : function (scope, element, attrs, ctrl, $transclude) {

            	var options = {            		
            		scope		: scope,
            		element		: element,
            		header 		: attrs.header,
            		transclude  : $transclude
            	};
            	
                element.data("options", options);
            }
        };
    });
    
}(window, document));