(function(window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
        .factory('widgetTab', [ 'widgetBase', TabWidget])
        .directive('wgTab', TabDirective);
    
    function TabWidget(widgetBase) {
    	
    	var widget = {};
    	
    	widget.determineOptions = function(container) {
    		
    		var puiTabs = angular.element(container).findAllSelector('wg-tab'),
            	tabs = [];
            
            angular.forEach(puiTabs, function(puiTab) {
                
                var options = angular.element(puiTab).data('options');
                options.options = widgetBase.determineOptions(options.scope, { onHide:undefined, onShow:undefined }, options.options, ['onShow','onHide']);
            	this.push(options);
            	
            }, tabs);
            
            puiTabs.remove();

            return tabs;
    	};
    	
    	return widget;
    }

    function TabDirective() {
        return {
            restrict: 'E',
            priority: 1000,
            transclude: true,
            link : function (scope, element, attrs, ctrl, $transclude) {

            	var options = {            		
            		scope		: scope,
            		element		: element,
            		header 		: attrs.header,
            		options		: attrs,
            		transclude  : $transclude
            	};
            	
                element.data("options", options);
            }
        };
    }
        
}(window, document));