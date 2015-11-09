(function(window, document, undefined) {
    "use strict";
    
    angular.module('angularWidgets')
        .factory('widgetFacet', FacetWidget)
        .directive('wgFacet', FacetDirective);

    function FacetWidget() {
    	
    	var widgetFacet = {};
    	
    	widgetFacet.determineFacetsOptions = function(container) {
    		
    		var puiFacets = angular.element(container).findAllSelector('wg-facet'),            	
            	facets = {};
            
            angular.forEach(puiFacets, function(puiFacet) {
            	
            	var facet = angular.element(puiFacet).data('options');
            	
            	this[facet.name] = facet;
            
            }, facets);
            
            puiFacets.remove();                       

            return facets;
    	};
    	
    	return widgetFacet;
    }
    
    function FacetDirective() {
        return {
        	restrict: 'E',
        	priority: 1000, 
        	transclude: true,
        	link: function facetLink($scope, $element, $attr, ctrl, $transclude) {
                
        		var options = {
                    scope       : $scope,
                    element     : $element,
                    name        : $attr.name,
                    transclude  : $transclude
	        	};

                $element.data("options", options);
        	}
        };
    }
    
}(window, document));