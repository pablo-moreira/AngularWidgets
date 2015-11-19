(function (window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')    	
    	.factory('widgetInputCheckbox', ['widgetBase', '$compile', '$timeout', InputCheckboxWidget])
		.directive('wgInputcheckbox', ['widgetInputCheckbox', InputCheckboxDirective]);
	
	function InputCheckboxWidget(widgetBase, $compile, $timeout) {

		AngularWidgets.configureWidget('inputradio', {
			onChange: undefined
		});
		
    	var widget = {};    	
    	
    	widget.checkedRadios = {};
    	
        widget.template = '<input type="checkbox" />';

        widget.buildWidget = function(scope, element, options) {
        	return new widget.Inputcheckbox(scope, element, options);
        };
  
    	widget.Inputcheckbox = widgetBase.createWidget({

    		init: function(options) {
				
				var $this = this;
				
    			this.element.wrap('<div class="ui-helper-hidden-accessible"></div>');    			
    			this.hidden = this.element.parent();
    			this.hidden.wrap('<div class="pui-checkbox ui-widget">');
				this.container = this.hidden.parent();
				this.container.append('<div class="pui-checkbox-box ui-widget ui-corner-all ui-state-default"><span class="pui-checkbox-icon pui-icon"></span></div>');
    			this.box = this.container.childrenSelector('.pui-checkbox-box');
    			this.icon = this.box.childrenSelector('.pui-checkbox-icon');
								
    			this.determineOptions(options);

     			this.element.attr({
     				'ng-model': this.options.value,
     				'ng-change' : '$onChange()',
     				'name' : this.options.name || this.options.value.replace('\.', '_')
     			});

				this.changeScope();     			     		
    			                                                   
                // check model default value
				var value = this.scope.$eval(this.element.attr('value'));
				
				if (value === true) {
                	this.box.addClass('ui-state-active');
                	this.icon.addClass('fa fa-fw fa-check');                
                }
                                     
                if (this.options.disabled) {

					this.element.attr('ng-disabled', this.options.disabled); 

	            	this.scope.$watch(this.options.disabled, function (value) {
	            		$this.enableDisable(value);
					});
	            }
	            else {
	            	this.enable();
	            }
                
				$compile(this.element)(this.scope);

            	$timeout(function () {
               		$this.initLabel();
                }, 300);

       			this.element[0].removeAttribute('value');
    			this.element[0].removeAttribute('disabled');
    			this.element[0].removeAttribute('onchange');

    			widgetBase.createBindAndAssignIfNecessary(this, "isChecked,check,uncheck,toggle,enable,disable,enableDisable");
    		},

    		changeScope: function() {

				var $this = this;

    			this.scope.$onChange = function() {
	                
					if($this.isChecked()) {
						$this.icon.addClass('fa fa-fw fa-check');
						$this.box.addClass('ui-state-active');
					}
					else {
						$this.box.removeClass('ui-state-active');
						$this.icon.removeClass('fa fa-fw fa-check');
					}

					if ($this.options.onChange) {
						$this.options.onChange($this.bindInstance, $this.isChecked());
					}
	            };
    		},
    		
	        determineOptions: function (options) {
				this.options = widgetBase.determineOptions(this.scope, AngularWidgets.getConfiguration().widgets.inputradio, options, ['onChange'], ['disabled']);
			},
        	
    		initLabel: function() {
    			
                this.label = angular.element(document.querySelectorAll('label[for="' + this.options.id + '"]'));
                this.label.addClass('pui-radiobutton-label');
                
                if (this.disabled) {
                	this.label.addClass('ui-state-disabled');
                }
                else {
                	this.bindLabelEvents();
                }
      		},
    		
    		bindLabelEvents: function() {    			
    			if (this.label !== undefined && this.label.length > 0) {
    				var $this = this;
	    			this.label.bind('click', function(e) {
						$this.toggle();
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
					$this.toggle();
	            });

	            this.bindLabelEvents();
	            
	            this.element.bind('focus', function() {
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
	            });
	        },

	        toggle: function() {
				
				if(this.isChecked()) {
					this.uncheck();
				} 
				else {
					this.check();
				}
			},
	        
	        isChecked: function() {
	            return this.element.attr('checked') ? true : false;
	        },

	        check: function() {
				if(!this.isChecked()) {
					this.element[0].click();
				}
			},

			uncheck: function() {
				if(this.isChecked()) {
					this.element[0].click();
				}
			},

	        enableDisable: function(value) {

            	if (value === true) {	
					this.disable();
                }
                else {
                    this.enable();
                }
    		},

	        enable: function () {
	        	this.disabled = false;
	        	this.box.prop('disabled', false);
	        	this.box.attr('aria-disabled', false);
	        	this.box.removeClass('ui-state-disabled');    	            
	            if (this.label !== undefined) {
	            	this.label.removeClass('ui-state-disabled');
	            }
	            this.bindEvents();
	        },

	        disable: function () {	
	        	this.disabled = true;	          	
	            this.box.prop('disabled', true);
	            this.box.attr('aria-disabled', true);
	            this.box.addClass('ui-state-disabled').removeClass('ui-state-hover');	            
	            if (this.label !== undefined) {
	            	this.label.addClass('ui-state-disabled');
	            }
	            this.unbindEvents();
	        },

	        unbindEvents: function () {
	        	
	        	this.box.off();

	            if (this.label !== undefined) {
	                this.label.off();
	            }
	        }
        });
        
        return widget;
    }

    function InputCheckboxDirective(widgetInputCheckbox) {       
        return {
            restrict: 'E',
            priority: 10,
            scope: true,
            link: function(scope, element, attrs) {
            	widgetInputCheckbox.buildWidget(scope, element, attrs);
			},
            replace: true,
            template: widgetInputCheckbox.template
        };
    }
    
}(window, document));