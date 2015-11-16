(function (window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')    	
    	.factory('widgetInputRadio', ['widgetBase', '$compile', '$timeout', InputRadioWidget])
    	.factory('widgetSelectOneRadio', ['widgetBase', '$compile', '$timeout', SelectOneRadioWidget])
		.directive('wgInputradio', ['widgetInputRadio', InputRadioDirective])
		.directive('wgSelectoneradio', ['widgetSelectOneRadio', SelectOneRadioDirective]);
	
	function InputRadioWidget(widgetBase, $compile, $timeout) {

		AngularWidgets.configureWidget('inputradio', {});
		
    	var widget = {};    	
    	
    	widget.checkedRadios = {};
    	
        widget.template = '<input type="radio" />';

        widget.buildWidget = function(scope, element, options) {
        	return new widget.Inputradio(scope, element, options);
        };
  
    	widget.Inputradio = widgetBase.createWidget({

    		init: function(options) {
				
				var $this = this;

    			this.element.wrap('<div class="ui-helper-hidden-accessible"></div>');
    			this.hidden = this.element.parent();
    			this.hidden.wrap('<div class="pui-radiobutton ui-widget">');
				this.container = this.hidden.parent();
				this.container.append('<div class="pui-radiobutton-box ui-widget pui-radiobutton-relative ui-state-default"><span class="pui-radiobutton-icon pui-icon"></span></div>');
    			this.box = this.container.childrenSelector('.pui-radiobutton-box');
    			this.icon = this.box.childrenSelector('.pui-radiobutton-icon');
				
    			this.determineOptions(options);

     			this.element.attr({
     				'ng-value': this.options.option,
     				'ng-model': this.options.value,
     				'name' : this.options.name || this.options.value.replace('\.', '_')
     			});
    			                                                   
                // check if model is default option
				var value = this.scope.$eval(this.element.attr('value'));
				var option = this.scope.$eval(this.element.attr('option'));
				
				if (value === option) {
                	this.box.addClass('ui-state-active');
                	this.icon.addClass('fa fa-fw fa-circle');
                	widget.checkedRadios[this.element.attr('name')] = this.box;
                }  
                                     
                if (options.disabled) {

					this.element.attr('ng-disabled', this.options.disabled); 

	            	this.scope.$watch(options.disabled, function (value) {
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
    			this.element[0].removeAttribute('option');
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
	                    $this.element[0].click();
	                    $this.box.addClass('ui-state-active');
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

	            this.bindLabelEvents();
	            
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
	                
	                $this.box.addClass('ui-state-active');	                

	                widget.checkedRadios[name] = $this.box;
	                
	                if ($this.onChange) {
	                	$this.onChange();
	                }
	            });
	        },
	        
	        isChecked: function() {
	            return this.element.attr('checked');
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
	            this.bindEvents();
	            this.box.removeClass('ui-state-disabled');
	            if (this.label !== undefined) {
	            	this.label.removeClass('ui-state-disabled');
	            }
	        },

	        disable: function () {
	        	this.disabled = true;
	            this.unbindEvents();
	            this.box.addClass('ui-state-disabled');
	            if (this.label !== undefined) {
	            	this.label.addClass('ui-state-disabled');
	            }
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

    function SelectOneRadioWidget(widgetBase, $compile, $timeout) {

    	AngularWidgets.configureWidget('selectoneradio', {
			optionLabel: undefined,
			layout: 'grid',
			columnSize: 3
    	});
    	
    	var widget = {};
    	
        widget.template =	'<div class="pui-selectoneradio ui-widget pui-grid pui-grid-responsive">' + 
							'</div>';

        widget.buildWidget = function(scope, element, options) {
        	return new widget.SelectOneRadio(scope, element, options);
        };
  
    	widget.SelectOneRadio = widgetBase.createWidget({

    		init: function(options) {
    			   			
    			var $this = this;

				this.childrenScope = [];
				
				this.determineOptions(options);
				
				this.id = this.element.attr('id');
				
				if(!this.id) {
					this.id = this.element.uniqueId('wg-ir').attr('id');
				}
				
    			this.items = this.scope.$eval(this.options.options);    			
				
				this.renderOptions();
    		},
    		
    		determineOptions: function(options) {
    			this.options = widgetBase.determineOptions(this.scope, AngularWidgets.getConfiguration().widgets.selectoneradio, options);
    		},
    		
    		renderOptions: function() {
				
				if (this.options.layout === 'horizontal') {
					this.renderHorizontal();
				}
				else {
					this.renderResponsive();
				}
    		},
    		
			renderHorizontal: function() {
				
				var $this = this,
					table = angular.element('<table><tbody><tr></tr></tbody></table>'),
        			tr = table.findAllSelector('tr');

				angular.forEach(this.items, function (item, index) {
					
					var itemScope = $this.createChildScope(item);
										
					var id = $this.id + '-' + index,
						itemLabel = ($this.options.optionLabel !== undefined) ? item[$this.options.optionLabel] : item;
						
					var tdLabel = angular.element('<td>' + $this.renderLabel(id, itemLabel) + '</td>');
					var tdRadio = angular.element('<td>' + $this.renderRadio(id) + '</td>');
						
					tr.append(tdRadio).append(tdLabel);

					$compile(tdRadio)(itemScope);					
				});

				this.element.append(table);
			},
			
			renderResponsive: function() {

    			var $this = this,
					used = 0,
					divRow,      		
					colSize = this.options.columnSize;

				if (this.options.layout === 'vertical') {
					colSize = 12;
				}
    			
				angular.forEach(this.items, function (item, index) {

					var itemScope = $this.createChildScope(item);
										
					var id = $this.id + '-' + index,
						itemLabel = ($this.options.optionLabel !== undefined) ? item[$this.options.optionLabel] : item;
						
					if (used === 0) {						
						divRow = angular.element('<div class="pui-grid-row"></div>')
							.appendTo($this.element);
					}

					var divCol = angular.element('<div class="pui-grid-col-' + colSize + '">').appendTo(divRow);
					used += colSize;
										
					divCol
					.append($this.renderRadio(id))
					.append($this.renderLabel(id, itemLabel));
					
					$compile(divCol)(itemScope);					
					
					if ((used + colSize) > 12) {
						used = 0;
					}
				});
			},

			renderRadio: function(id) {
				
				var radio = '<wg-inputradio id="' + id + '" value="' + this.options.value + '" option="$item"';
				
				if (this.options.disabled) {
					radio+= ' disabled="' + this.options.disabled + '"';
				}
				
				radio+= '></wg-inputradio>';
				
				return radio;
			},

    		renderLabel: function(id, itemLabel) {
    			return '<label for="' + id + '">' + itemLabel + '</label>';
    		},

			createChildScope: function(item) {
								
				var itemScope = this.scope.$new(false, this.scope);
				itemScope.$item = item;
					
				// Store childscope for destroy 
				this.childrenScope.push(itemScope);
					
				return itemScope;
			}
        });
        
        return widget;
    }

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
    }

    function SelectOneRadioDirective(widgetSelectOneRadio) {       
        return {
            restrict: 'E',
            priority: 10,
            scope: true,
            link: function(scope, element, attrs) {
            	widgetSelectOneRadio.buildWidget(scope, element, attrs);
			},
            replace: true,
            template: widgetSelectOneRadio.template
        };
    }
    
}(window, document));