(function (window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
    	.config(['$wgConfigProvider', InputRadioConfig])
    	.factory('widgetInputRadio', ['widgetBase', '$compile', '$timeout', InputRadioWidget])
		.directive('wgInputradio', ['widgetInputRadio', InputRadioDirective]);
		
	function InputRadioConfig($wgConfigProvider) {
		$wgConfigProvider.configureWidget('inputradio', {});
	}
	
	function InputRadioWidget(widgetBase, $compile, $timeout) {

    	var widget = {};

    	widget.checkedRadios = {};
    	
        widget.template = '<input type="radio" />';

        widget.buildWidget = function(scope, element, options) {
        	return new widget.Radio(scope, element, options);
        };
  
    	widget.Radio = widgetBase.createWidget({

    		init: function(options) {
    			
    			this.element.wrap('<div class="ui-helper-hidden-accessible"></div>');
    			this.hidden = this.element.parent();
    			this.hidden.wrap('<div class="pui-radiobutton ui-widget">');
				this.container = this.hidden.parent();
				this.container.append('<div class="pui-radiobutton-box ui-widget pui-radiobutton-relative ui-state-default"><span class="pui-radiobutton-icon pui-icon"></span></div>');
    			this.box = this.container.childrenSelector('.pui-radiobutton-box');
    			this.icon = this.box.childrenSelector('.pui-radiobutton-icon');
				
				this.options = widgetBase.determineOptions(this.scope, widgetBase.getConfiguration().widgets.inputradio, options, ['onChange'], ['disabled']);

     			this.element.attr({
     				'ng-value': this.options.option,
     				'ng-model': this.options.value,
     				'name' : this.options.name || this.options.value.replace('\.', '_')
     			});
    			
                this.disabled = this.element.prop('disabled');
                    
                var $this = this;
                
                $timeout(function () {
                	$this.initLabel();
                }, 1000);                
                
				$compile(this.element)(this.scope);
                
                // check if model is default option
				var value = this.scope.$eval(this.element.attr('value'));
				var option = this.scope.$eval(this.element.attr('option'));
				
				if (value === option) {
                	this.box.addClass('ui-state-active');
                	this.icon.addClass('fa fa-fw fa-circle');
                	widget.checkedRadios[this.element.attr('name')] = this.box;
                }
                
                if (this.disabled) {
                    this.box.addClass('ui-state-disabled');
                } 
                else {
                	this.bindEvents();
                }

       			this.element[0].removeAttribute('value');
    			this.element[0].removeAttribute('disabled');
    			this.element[0].removeAttribute('option');
    		},
    		
	        determineOptions: function (options) {
	        	this.options = widgetBase.determineOptions(this.scope, widgetBase.getConfiguration().widgets.radio, options);
			},
        	
    		initLabel: function() {
    			
                this.label = angular.element(document.querySelectorAll('label[for="' + this.options.id + '"]'));
                this.label.addClass('pui-radiobutton-label');
                
                if (!this.disabled) {
                	this.bindLabelEvents();
                }                
      		},
    		
    		bindLabelEvents: function() {
    			if (this.label) {
    				var $this = this;
	    			this.label.bind('click', function(e) {
	                    $this.element[0].click();
	                    e.preventDefault();
	                });
    			}
    		},
			
			bindEvents: function() {
	            
				var $this = this;
	        
	            this.box
	            .bind('mouseover', function() {
	            	if(!$this.isChecked()) 
	            		$this.box.addClass('ui-state-hover');
	            })
	            .bind('mouseout', function() {
	                if(!$this.isChecked())
	                    $this.box.removeClass('ui-state-hover');
	            })
	            .bind('click', function() {
	                if(!$this.isChecked()) {
	                    $this.element[0].click();//triggerHandler("click");
//	                    if(PUI.browser.msie && parseInt(PUI.browser.version, 10) < 9) {
//	                        $this.element.trigger('change');
//	                    }
	                }
	            });
	            
	            this.element
	            .bind('focus', function() {
	                if($this.isChecked()) {
	                    $this.box.removeClass('ui-state-active');
	                }
	                $this.box.addClass('ui-state-focus');
	            })
	            .bind('blur', function() {
	            	if($this.isChecked()) {
	                    $this.box.addClass('ui-state-active');
	                }

	                $this.box.removeClass('ui-state-focus');
	            })
	            .bind('change', function(e) {
	                
	            	var name = $this.element.attr('name');

	                if(widget.checkedRadios[name]) {
	                	widget.checkedRadios[name].removeClass('ui-state-active ui-state-focus ui-state-hover').childrenSelector('.pui-radiobutton-icon').removeClass('fa fa-fw fa-circle');
	                }

	                $this.icon.addClass('fa fa-fw fa-circle');
	                
	                if(!$this.element.is(':focus')) {
	                    $this.box.addClass('ui-state-active');
	                }

	                widget.checkedRadios[name] = $this.box;
	                
	                if ($this.onChange) {
	                	$this.onChange();
	                }
	            });
	        },
	        
	        isChecked: function() {
	            return this.element.attr('checked');
	        },

	        unbindEvents: function () {
	        
	        	this.box.off();

	            if (this.label.length > 0) {
	                this.label.off();
	            }
	        },

	        enable: function () {
	            this.bindEvents();
	            this.box.removeClass('ui-state-disabled');
	        },

	        disable: function () {
	            this.unbindEvents();
	            this.box.addClass('ui-state-disabled');
	        }
        });
        
        return widget;
    };

    function InputRadioDirective(widgetInputRadio) {       
        return {
            restrict: 'E',
            priority: 10,
            scope: true,
            link: function(scope, element, attrs) {
            	widgetInputRadio.buildWidget(scope, element, attrs);
			},
            replace: true,
            template: widgetInputRadio.template
        };
    };
    
}(window, document));