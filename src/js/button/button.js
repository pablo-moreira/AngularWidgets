/*globals angular */

(function (window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetButton', ['$interpolate', 'widgetBase', function ($interpolate, widgetBase) {

    	var widget = {};

        widget.template = '<button class="pui-button ui-widget ui-state-default ui-corner-all"></button>';

        widget.buildWidget = function(scope, element, options) {
        	return new widget.Button(scope, element, options);
        };

        widget.create = function(scope, container, options) {
        	
        	var element = angular.element(this.template);
        	
        	container.append(element);
        	
        	return new widget.Button(scope, element, options);
        };
  
    	widget.Button = widgetBase.createWidget({
        	
			optionsDefault: {
				value: null,
				icon: null,
				iconPosition: 'left',
				action: null,		        	
			},
        	
    		init: function(options) {
        		        		
        		this.determineOptions(options);

	            var styleClass = '';

	            if (this.options.icon) {
	                styleClass = this.options.value ? 'pui-button-text-icon-' + this.options.iconPosition : 'pui-button-icon-only';
	            }
	            else {
	                styleClass = 'pui-button-text-only';
	            }
	            
	            this.element.addClass(styleClass).text('');
	            
	            if (this.options.icon) {
	            	this.icon = angular.element('<span class="pui-button-icon-' + this.options.iconPosition + ' pui-icon fa fa-fw ' + this.options.icon + '" />')
	            		.appendTo(this.element);
	            }
	            
	            this.value = angular.element('<span class="pui-button-text"></span>')
	            	.appendTo(this.element);
	            
        		var $this = this;

	            if (this.options.value) {
	            	widgetBase.watchExpression(this.scope, this.element.attr('value'), function(value) {
                    	$this.setValue(value);
					});
	            }
	            else {
	            	this.setValue('');
	            }
	           
	            this.bindEvents();
	            
	            if (options.visible !== undefined) {
	            	this.scope.$watch(options.visible, function (value) {
	            		if (value) {
	            			$this.show();
	            		}
	            		else {
	            			$this.hide();
	            		}
	                });
	            }
	            
	            if (options.disabled !== undefined) {
	            	this.scope.$watch(options.disabled, function (value) {
	            		if (value) {
	            			$this.disable();
	            		}
	            		else {
	            			$this.enable();
	            		}
	                });	            	
	            }
	            
	            this.element[0].removeAttribute('disabled');
	            
	            // Aria
	            this.element.attr('role', 'button');	            
	            
        	},
        	
	        determineOptions: function (options) {
	        	this.options = widgetBase.determineOptions(this.scope, this.optionsDefault, options);
			},
			
	        setValue: function(text) {
				if (text === '') {
					this.value.text('-');
	        	}
	        	else {
	        		this.value.text(text);
	        	}
	        },
	        	        
	        click: function(e) {
	        	if (this.options.action) {
	        		this.scope.$eval(this.options.action);
	        		this.scope.safeApply();
	        	}
	        },
	        
	        enable: function() {
	        	this.element.removeClass('ui-state-disabled');
	            this.element.attr('aria-disabled', false);
	        },
	        
	        disable: function() {                
                this.element.addClass('ui-state-disabled');
                this.element.attr('aria-disabled', true);
	        },
	        
	        show: function() {
	        	this.element.attr('aria-hidden', false);
	        	this.element.removeClass('pui-hidden');
	        	widgetBase.showWithAnimation(this.element);
	        },
	        
	        hide: function() {
	        	this.element.attr('aria-hidden', true);
	        	var $this = this;
	        	widgetBase.hideWithAnimation(this.element, function() {
	        		$this.element.addClass('pui-hidden');
	        	});
	        },
	        
	        isVisible: function() {
	        	return !this.element.hasClass('pui-hidden');
	        },
	        
	        toggleVisible: function(value) {
	        	if (this.isVisible()) {
	        		this.hide();
	        	}
	        	else {
	        		this.show();
	        	}
	        },	        
	        
	        bindEvents: function() {
	            	            
	        	var $this = this;
	            
	        	widgetBase.hoverAndFocus(this.element);
	        	widgetBase.mouseDownAndUp(this.element, function(e) {
	        		$this.click(e);
	        	});
	        	
	        	widgetBase.onKeydownEnterOrSpace(this.element, function(e) {
	        		$this.element.addClass('ui-state-active');
	        		$this.click(e);
	        	})
	        	
	        	this.element.bind('keyup', function(e){ 
	        		$this.element.removeClass('ui-state-active');	        		
	        	});
	        },
	        
	        unbindEvents: function() {
	            this.element.off('mouseover.puibutton mouseout.puibutton mousedown.puibutton mouseup.puibutton focus.puibutton blur.puibutton keydown.puibutton keyup.puibutton');
	        }
        });
        
        return widget;
    }]);

    angular.module('pje.ui').directive('puiButton', ['widgetButton', function (widgetButton) {       
        return {
            restrict: 'E',
            priority: 10,
            scope: true,
            link: function(scope, element, attrs) {
            	widgetButton.buildWidget(scope, element, attrs);
			},
            replace: true,
            template: widgetButton.template
        };
    }]);
    
}(window, document));