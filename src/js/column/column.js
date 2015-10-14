(function(window, document, undefined) {
    "use strict";

    angular.module('pje.ui')
    .factory('widgetColumn', function () {
    	
    	var widgetColumn = {}
    	
    	widgetColumn.determineColumnsOptions = function(container) {
    		
    		var puiColumns = angular.element(container).findAllSelector('pui-column'),
            	columns = [];
            
            angular.forEach(puiColumns, function(puiColumn) {
            	this.push(angular.element(puiColumn).data('options'));
            }, columns);
            
            puiColumns.remove();

            return columns;
    	}
    	
    	return widgetColumn;
    })
	.directive('puiColumn', function () {
        return {
        	priority: 1000,
        	restrict: 'E',
        	compile: function compile(element, attrs, transclude) {
        		
        		var options = {        			
	        		field 		: attrs.value,
	        		sortBy		: attrs.sortby || attrs.value,
	        		sortable 	: attrs.sortable || attrs.sortby != null ? true : false,        		
	        		headerText	: attrs.headertext || attrs.value,
	        		element		: element,
	        		contents	: element[0].innerHTML.trim()        		
	        	};
    				
        		element.html('');
        		
        		return {
        			pre: function (scope, element, attrs) {
        				element.data("options", options);		
        			},
        			post: function (scope, element, attrs) {}
                }
        	}
        };
    });
    
}(window, document));