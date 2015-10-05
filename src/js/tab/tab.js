(function(window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetTab', function() {
    	
    	var widget = {}
    	
    	widget.determineOptions = function(container) {
    		
    		var elemTabs = container.find('pui-tab'),
            	tabs = [];
            
            angular.forEach(elemTabs, function(elemTab) {
            	this.push(angular.element(elemTab).data('options'));
            }, tabs);
            
            elemTabs.remove();

            return tabs;
    	}
    	
    	return widget;
    })
    .directive('puiTab', function () {
        return {
            restrict: 'E',
            priority: 5,
            link : function (scope, element, attrs) {

            	var options = {
            		header 		: attrs.header,
            		element		: element,
            		scope		: scope
            	};
            	
                element.data("options", options);
            }
        };
    });
    
}(window, document));