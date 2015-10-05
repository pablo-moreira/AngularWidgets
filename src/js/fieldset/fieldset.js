/*globals angular */

(function(window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetFieldset', ['widgetBase', function(widgetBase) {
        
        var widget = {};
        
        widget.template = '<fieldset class="pui-fieldset ui-widget ui-widget-content ui-corner-all">' +
        				  	'<legend class="pui-fieldset-legend ui-corner-all ui-state-default"></legend>' +
        					'<div ng-transclude class="pui-fieldset-content"></div>' +
        				  '</fieldset>';

        widget.buildWidget = function(scope, element, attrs) {
        	return new widget.Fieldset(scope, element, attrs);        	
        };
        
        widget.create = function(scope, container, options) {
        	
        	var element = angular.element(this.template);
        	
        	container.append(element);
        	
        	return new widget.Fieldset(scope, element, options);
        };   

    	widget.Fieldset = widgetBase.createWidget({
    		        	
			init: function (options) {
				
	            this.legend = this.element.childrenSelector('.pui-fieldset-legend');
	            this.content = this.element.childrenSelector('.pui-fieldset-content');
	
				this.determineOptions(options);
				
				var $this = this;
				
				if (this.element.attr('legend')) {
					widgetBase.watchExpression(this.scope, this.element.attr('legend'), function(value) {
						$this.setLegend(value);
					});
				}
				
	            if(this.options.toggleable) {
	                this.element.addClass('pui-fieldset-toggleable');
	                this.toggler = angular.element('<span class="pui-fieldset-toggler ui-icon" />').prependTo(this.legend);
	                this.bindEvents();

	                if(this.options.collapsed) {
	                    this.content.hide();
	                    this.toggler.addClass('ui-icon-plusthick');
	                }
	                else {
	                    this.toggler.addClass('ui-icon-minusthick');
	                }
	            }
	            
	            widgetBase.createBindAndAssignIfNecessary(this, "toggle,collapse,expand,isCollapsed,setLegend,getLegend");
        	},
        	
	        determineOptions: function (options) {
        		        
	        	this.options = {
	        		toggleable: false,
		            toglleDuration: 'normal',
		            collapsed: false,
		            onToggle: null
	        	};
	        	
	        	widgetBase.determineOptions(this.scope, this.options, options, ['onToggle']);	        	
			},		
			
			bindEvents: function() {
	            
				var $this = this;

				widgetBase.hoverAndFocus(this.legend);
				widgetBase.mouseDownAndUp(this.legend);
				
	            this.legend.click(function(e) { 
	            	$this.toggle(e); 
	            	$this.scope.safeApply(); 
	            });
	        },
	        
	        toggle: function(e) {
	            
	        	var $this = this;
	            
	            if(this.options.collapsed) {
	                this.toggler.removeClass('ui-icon-plusthick').addClass('ui-icon-minusthick');
	                this.content.show();
	            } 
	            else {
	                this.toggler.removeClass('ui-icon-minusthick').addClass('ui-icon-plusthick');
	                this.content.hide();
	            }
	            
	            this.options.collapsed = !this.options.collapsed;
	            
	            if (this.options.onToggle) {
	            	this.options.onToggle(e, this.bindInstance);
	            }
	        },

	        collapse: function() {
	            if (!this.options.collapsed) {
	                this.toggle(null);
	            }
	        },

	        expand: function() {
	            if (this.options.collapsed) {
	                this.toggle(null);
	            }
	        },		
	        
	        isCollapsed: function () {
	        	return this.options.collapsed;
	        },
	        
	        setLegend: function(text) {
	        	this.legend.text(text);
	        },
	        
	        getLegend: function() {
	        	return this.legend.text();
	        }
        });

        return widget;
    }]);

    angular.module('pje.ui').directive('puiFieldset', ['widgetFieldset', function (widgetFieldset) {
    	return {
    		restrict: 'E',
    		transclude: true,
    		scope: true,
    		link: function(scope, element, attrs) {
    			widgetFieldset.buildWidget(scope, element, attrs);
			},
			replace: true,
			template: widgetFieldset.template
    	};
    }]);
    
}(window, document));