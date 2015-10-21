/*globals angular */

(function(window, document, undefined) {
    "use strict";

    angular.module('pje.ui')
    	.factory('widgetFieldset', ['widgetBase', FieldsetWidget])
    	.directive('puiFieldset', ['widgetFieldset', FieldsetDirective]);
    
    function FieldsetWidget(widgetBase) {
        
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
    		         		        
			optionsDefault: {
				toggleable: false,
				toglleDuration: 'normal',
				collapsed: false,
				onToggle: null
			},
    		        	
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
	                this.toggler = angular.element('<span class="pui-fieldset-toggler fa fa-fw" />').prependTo(this.legend);
	                this.bindEvents();

	                if(this.options.collapsed) {
	                    this.content.hide();
	                    this.toggler.addClass('fa-plus');
	                }
	                else {
	                    this.toggler.addClass('fa-minus');
	                }
	            }
	            
	            widgetBase.createBindAndAssignIfNecessary(this, "toggle,collapse,expand,isCollapsed,setLegend,getLegend");
        	},
        	
	        determineOptions: function (options) {        	
	        	this.options = widgetBase.determineOptions(this.scope, this.optionsDefault, options, ['onToggle']);	        	
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
	                this.toggler.removeClass('fa-plus').addClass('fa-minus');
	                this.content.show();
	            } 
	            else {
	                this.toggler.removeClass('fa-minus').addClass('fa-plus');
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
    }
    
    function FieldsetDirective(widgetFieldset) {
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
    }
    
}(window, document));