
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
            	
            	this[facet.name] = facet;
            
            }, facets);
            
            puiFacets.remove();                       

            return facets;
    	}
    	
    	return widgetFacet;
    })
    .directive('puiFacet', function () {
        return {
        	restrict: 'E',
        	priority: 1000,        	
        	compile: function compile(element, attrs, transclude) {
        		
        		var options = {
                    name 		: attrs.name,
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