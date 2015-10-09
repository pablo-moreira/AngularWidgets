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
        	restrict: 'E',
        	priority: 1000,
        	transclude: true,
        	link: function columnLink($scope, $element, attrs, ctrl, $transclude) {

        		var options = {   
        			scope					: $scope,     			
	        		element    				: $element,
	        		transclude 			 	: $transclude,
	        		field 					: attrs.value,
	        		sortBy					: attrs.sortby || attrs.value,
	        		sortable 				: attrs.sortable || attrs.sortby != null ? true : false,        		
	        		headerText				: attrs.headertext || attrs.value
	        	};

                $element.data("options", options);
        	}
        };
    });
    
}(window, document));