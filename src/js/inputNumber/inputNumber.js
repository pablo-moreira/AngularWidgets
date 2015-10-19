(function(window, document, undefined) {

	"use strict";

	angular.module('pje.ui')
		.factory('widgetInputNumber', ['widgetBase', '$parse', '$locale', InputNumberWidget])
		.directive('puiInputnumber', ['widgetInputNumber', InputNumberDirective]);

	function InputNumberWidget(widgetBase, $parse, $locale) {

		//         var linkFn = function (scope, element, attrs) {
		//             var options = widgetInputText.determineOptions(scope, element, attrs),
		//                 inputData = widgetInputText.buildWidget(element, attrs, options);

		//             widgetInputText.addBehaviour(scope, inputData);
		//             widgetInputText.registerEvents(inputData);

		//         };

		var widgetInputText = {},
			eventsHelper = {},
			widget = {};

		widget.template =	'<span class="pui-inputnumber pui-inputtext ui-widget ui-state-default ui-corner-all">' +
								'<input type="number" role="textbox" aria-disabled="false" aria-readonly="false" aria-multiline="false">' +
							'</span>';

		widget.buildWidget = function(scope, element, attrs) {
			return new widget.InputNumber(scope, element, attrs);
		};

		widget.InputNumber = widgetBase.createWidget({

			optionsDefault: {
				type: 'currency', // integer (default), float, currency, percent
				locale: null,
				disabled: false,
				readonly: false,
				symbol: null, // locale for currency and % for percent
				symbolLocation: 'before', // before (default) or after
				groupSeparator: null, // "locale"
				decimalSeparator: null, // "locale"
				decimalPrecision: null, 
				allowNegative: true // false (default), true;
			},

			init: function(options) {

				this.determineOptions(options);

				widgetBase.verifyRequiredOptions(this, ['value']);

				var $this = this;

				this.input = this.element.childrenSelector('input');

				this.scope.$watch(this.element.attr('value'), function(value) {
					$this.setValue(value, false);
				});

				this.renderSymbol();			

				this.addBehaviour();
				this.bindEvents();
			},

			renderSymbol: function() {
				
				if (!this.options.symbolLocation !== 'none') {

					this.symbolContainer = angular.element('<span class="pui-inputnumber-symbol">' + this.options.symbol + '</span>');

					if (this.options.symbolLocation === 'before') {
						this.element.prepend(this.symbolContainer);
					}
					else {
						this.element.append(this.symbolContainer);
					}
				}				
			},

			determineOptions: function(options) {

				var optionsDefault = angular.copy(this.optionsDefault),
					type = options.type || optionsDefault.type;
				
				optionsDefault.decimalSeparator = $locale.NUMBER_FORMATS.DECIMAL_SEP;
				optionsDefault.groupSeparator = $locale.NUMBER_FORMATS.GROUP_SEP;

				if (type === 'currency') {
					optionsDefault.symbol = $locale.NUMBER_FORMATS.CURRENCY_SYM;
					optionsDefault.decimalPrecision = 2;
				}
				else if (type === 'percent') {
					optionsDefault.symbol = '%';
				}
				else if (type === 'float') {

				}
			
				this.options = widgetBase.determineOptions(this.scope, optionsDefault, options, [], ['disabled']);

				if (this.options.decimalPrecision > 0) {
					
					this.options.allowDecimal = true;
					
					/* TODO */
					var keyCodes = {
						','	: widgetBase.keyCode.COMMA,
						'.' : widgetBase.keyCode.DOT,
					}
					
					this.options.decimalSeparatorKeyCode = keyCodes[this.options.decimalSeparator];
				}
			},

			setValue: function(value, updateModel) {

				if (value === undefined || isNaN(value)) {
					value = null;
				}
			
				if (this.value !== value) {
					
					this.value = value;
					
					if (this.input.val() !== (value !== null ? value.toString() : "")) {
						this.input.val(value);	
					}					

					if (updateModel !== false) {
						this.updateModel();
					}	
				}				
			},

			updateModel: function() {

				var parseValue = $parse(this.options.value);
				parseValue.assign(this.scope, this.value);

				this.scope.safeApply();
			},

			addBehaviour: function() {

				widgetBase.hoverAndFocus(this.element);

				//                 if (scope.puiDisabled !== undefined) {
				//                     widgetBase.watchPuiDisabled(scope, inputData, widgetInputText.enableDisable);
				//                 }
				//                 if (scope.rendered !== undefined) {
				//                     widgetBase.watchRendered(scope, inputData, widgetInputText.showHide);
				//                 }
			},

			bindEvents: function() {

				var $this = this;

				this.input.bind('keydown', function(e) {
					$this.onKeydown(e);
				});
				this.input.bind('keypress', function(e) {
					$this.onKeypress(e);
				});
				this.input.bind('keyup', function(e) {
					$this.onKeyup(e);
				});

			},
			
			onKeypress: function (e) {

				var char = '';
				
				if (e.which == null)
					char= String.fromCharCode(e.keyCode);    // old IE
				else if (e.which != 0 && e.charCode != 0)
					char= String.fromCharCode(e.which);	  // All others
				else {
					 // special key
				}

				if (char === this.options.decimalSeparator) {
					e.preventDefault();
				}

				console.log(char);
			},

			onKeydown: function(e) {

				var KC = widgetBase.keyCode,
					keyCode = e.which || e.keyCode,
					keysSkip = KC.ARROWS.concat([KC.BACKSPACE, KC.DELETE, KC.HOME, KC.END, KC.TAB, KC.DELETE]),
					keysAllowed = KC.NUMERICS;

				
				console.log(keyCode);

				if (keysSkip.contains(keyCode) 
					|| (this.options.allowDecimal && this.options.decimalSeparatorKeyCode === keyCode)) {
					return;
				}
				// Negative handle
				else if (this.options.allowNegative && keyCode === KC.MINUS && this.input.val().indexOf('-') === -1) {					
					this.input.val('-' + this.input.val())
					e.preventDefault();
				}
				// Positve handle		
				//else if (keyCode === KC.)
				// Not numeric handle
				else if (!keysAllowed.contains(keyCode)) {
					e.preventDefault();
				}
			},

			onKeyup: function(e) {
				
				var val = this.input.val();
				
				this.setValue(this.options.decimalPrecision !== null ? parseFloat(val) : parseInt(val));
			}
		});

		widgetInputText.enableDisable = function(inputData, value) {
			widgetInputText.enableDisableStatic(inputData.element, value);
		};

		widgetInputText.enableDisableStatic = function(inputElement, value) {
			if (value === true) {
				widgetBase.resetHoverAndFocus(inputElement);
				inputElement.addClass('ui-state-disabled');
				inputElement.attr('disabled', 'disabled');

			} else {
				inputElement.removeClass('ui-state-disabled');
				widgetBase.hoverAndFocus(inputElement);
				inputElement.removeAttr('disabled');
			}
		};


		widgetInputText.showHide = function(inputData, value) {
			if (value === true) {
				inputData.element.removeClass("pui-hidden");
				widgetBase.showWithAnimation(inputData.element);
			} else {
				widgetBase.hideWithAnimation(inputData.element, function() {
					inputData.element.addClass("pui-hidden");
				});
			}
		};



		// TODO this should go in the core when used by more then 1 widget.

		eventsHelper.handleEnterKey = function(element, callback) {
			element.bind("keyup", function(e) {
				var keyCode = widgetBase.keyCode,
					key = e.which;

				if (key === keyCode.ENTER) {
					callback();
					e.preventDefault();
				}
			});
		};

		widgetInputText.registerEvents = function(inputData) {
			var _events = inputData.element.findAllSelector('pui-event');
			angular.forEach(_events, function(event) {
				var puiEventData = angular.element(event).data('puiEvent');

				if (puiEventData.event === 'ngEnter') {
					eventsHelper.handleEnterKey(inputData.element, puiEventData.callback);
				}

			});
			_events.remove(); // As events aren't graphic, they don't need to stay oin the HTML (but is is OK it not done)


		};

		return widget;

	};

	function InputNumberDirective(widgetInputNumber) {
		return {
			restrict: 'E',
			scope: true,
			replace: true,
			transclude: true,
			template: widgetInputNumber.template,
			link: function(scope, element, attrs) {
				widgetInputNumber.buildWidget(scope, element, attrs);
			}
		};
	};

}(window, document));