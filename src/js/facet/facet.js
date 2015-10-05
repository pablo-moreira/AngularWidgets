
/*globals angular event AngularWidgets */

(function(window, document, undefined) {
    "use strict";
    
    angular.module('pje.ui')
    .factory('widgetFacet', function () {
    	
    	var widgetFacet = {}
    	
    	widgetFacet.determineFacetsOptions = function(container) {
    		
    		var puiFacets = angular.element(container).findAllSelector('pui-facet'),            	
            	facets = {};
            
            angular.forEach(puiFacets, function(puiFacet) {
            	
            	var facet = angular.element(puiFacet).data('options');
            	
            	this[facet.name] = facet.element;
            
            }, facets);
            
            puiFacets.remove();                       

            return facets;
    	}
    	
    	return widgetFacet;
    })
    .directive('puiFacet', function () {
        
    	var linkFn = function (scope, element, attrs) {
        	
        	var options = {        			
        		name 		: attrs.name,
        		element		: element
        	};
        	
            element.data("options", options);
        };
        
        return {
            restrict: 'E',
            priority: 5,
            link : linkFn
        };
    });
    
}(window, document));