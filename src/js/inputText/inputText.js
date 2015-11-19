(function (window, document, undefined) {
	"use strict";

	angular.module('angularWidgets')
		.factory('widgetInputText', ['widgetBase', '$compile', '$interpolate', InputTextWidget])
		.directive('wgInputtext', ['widgetInputText', InputTextDirective]);
	
	function InputTextWidget(widgetBase, $compile, $interpolate) {

		AngularWidgets.configureWidget('inputtext', {
			onEnterKey: undefined
		});
		
		var widget = {};

		widget.template = '<input type="text" class="pui-inputtext ui-widget ui-state-default ui-corner-all" />';

		widget.buildWidget = function(scope, element, options) {
			return new widget.Inputtext(scope, element, options);
		};
  
		widget.Inputtext = widgetBase.createWidget({

			init: function(options) {
				
				var $this = this;

				this.determineOptions(options);

				this.element.attr({
					'ng-model': this.options.value,
					'name' : this.options.name || this.options.value.replace('\.', '_')
				});   

				if (this.options.disabled) {

					this.element.attr('ng-disabled', this.options.disabled);

					this.scope.$watch(this.options.disabled, function (value) {
						$this.onChangeDisabled(value);
					});
				}
				else {
					this.onChangeDisabled(false);
				}

				$compile(this.element)(this.scope);

				this.element[0].removeAttribute('value');
				this.element[0].removeAttribute('disabled');

				//aria
				this.element.attr({
					'role': 'textbox',
					'aria-readonly': this.element.prop('readonly'),
					'aria-multiline': false
				});

				widgetBase.createBindAndAssignIfNecessary(this, "enable,disable,enableDisable,getValue");          
			},

			determineOptions: function (options) {
				this.options = widgetBase.determineOptions(this.scope, AngularWidgets.getConfiguration().widgets.inputtext, options, ['onEnterKey'], ['disabled']);
			},

            bindEvents: function() {
				
                var $this = this;

				widgetBase.hoverAndFocus(this.element);

				widgetBase.handleOnEnterKey(this.scope, this.element, function() { $this.options.onEnterKey($this.bindInstance); });
			},

			unbindEvents: function() {

			},

			onChangeDisabled: function(disabled) {
				
				this.element.attr('aria-disabled', disabled);
                
                if (disabled) {	
                    this.element
                        .addClass('ui-state-disabled')
                        .removeClass('ui-state-focus ui-state-hover');
                    this.unbindEvents();
                }
                else {
                    this.element.removeClass('ui-state-disabled');
                    this.bindEvents();
                }
			},

			enableDisable: function() {

                var disabled = widgetBase.getModelValue(this.scope, this.options.disabled);

                if (disabled) {
                    this.disable();
                }
                else {
                    this.enable();
                }
			},

			enable: function() {
                widgetBase.setModelValue(this.scope, this.options.disabled, false);
			},

			disable: function() {
                widgetBase.setModelValue(this.scope, this.options.disabled, true);
			},

			getValue: function() {
				return widgetBase.getModelValue(this.scope, this.options.value);
			}
		});
		
		/* TODO - Deprecated - autocomplete use that */
		widget.enableDisableStatic = function (inputElement, value) {
			if (value === true) {
				widgetBase.resetHoverAndFocus(inputElement);
				inputElement.addClass('ui-state-disabled');
				inputElement.attr('disabled','disabled');
			} 
			else {
				inputElement.removeClass('ui-state-disabled');
				widgetBase.hoverAndFocus(inputElement);
				inputElement.removeAttr('disabled');
			}
		};
		
		return widget;
	}

	function InputTextDirective(widgetInputText) {       
		return {
			restrict: 'E',
			scope: true,            
			link: function(scope, element, attrs) {
				widgetInputText.buildWidget(scope, element, attrs);
			},
			replace: true,
			template: widgetInputText.template
		};
	}

}(window, document));