(function(window, document, undefined) {

	"use strict";

	angular.module('pje.ui')
		.factory('widgetInputNumber', ['widgetBase', '$parse', '$locale', InputNumberWidget])
		.directive('puiInputnumber', ['widgetInputNumber', InputNumberDirective]);

	function InputNumberWidget(widgetBase, $parse) {

		function setCaretPosition(input, pos) {
 			
 			// Input's hidden
			if (!input || input.offsetWidth === 0 || input.offsetHeight === 0) {
				return;
			}

			if (input.setSelectionRange) {
				input.focus();
				input.setSelectionRange(pos, pos);				
			}
			else if (input.createTextRange) {
				
				var range = input.createTextRange();
				
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		}

		function setCursorPosition(elem, pos) {
			
			if (elem.setSelectionRange) {
				elem.focus();
				elem.setSelectionRange(pos, pos);
			} 
			else if (elem.createTextRange) {
			
				var range = elem.createTextRange();
			
				range.collapse(true);
				range.moveEnd("character", pos);
				range.moveStart("character", pos);
				range.select();
			}
		}

		function getInputSelection(el) {

			var start = 0,
				end = 0,
				normalizedValue,
				range,
				textInputRange,
				len,
				endRange;

			if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") {
				start = el.selectionStart;
				end = el.selectionEnd;
			} 
			else {
				range = document.selection.createRange();

				if (range && range.parentElement() === el) {
					len = el.value.length;
					normalizedValue = el.value.replace(/\r\n/g, "\n");

					// Create a working TextRange that lives only in the input
					textInputRange = el.createTextRange();
					textInputRange.moveToBookmark(range.getBookmark());

					// Check if the start and end of the selection are at the very end
					// of the input, since moveStart/moveEnd doesn't return what we want
					// in those cases
					endRange = el.createTextRange();
					endRange.collapse(false);

					if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
						start = end = len;
					} 
					else {
						start = -textInputRange.moveStart("character", -len);
						start += normalizedValue.slice(0, start).split("\n").length - 1;

						if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
							end = len;
						} else {
							end = -textInputRange.moveEnd("character", -len);
							end += normalizedValue.slice(0, end).split("\n").length - 1;
						}
					}
				}
			}

			return {
				start: start,
				end: end
			};
		} // getInputSelection

		function getCaretPosition(input) {
		
			if (!input)
				return 0;
			if (input.selectionStart !== undefined) {
				return input.selectionStart;
			} else if (document.selection) {
				if (isFocused(iElement[0])) {
					// Curse you IE
					input.focus();
					var selection = document.selection.createRange();
					selection.moveStart('character', input.value ? -input.value.length : 0);
					return selection.text.length;
				}
			}
			return 0;
		}

		function preventDefault(e) {
			//standard browsers
			if (e.preventDefault) { 
				e.preventDefault();
			} 
			// old internet explorer
			else {
				e.returnValue = false;
			}
		}

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
								'<input type="text" role="textbox" aria-disabled="false" aria-readonly="false" aria-multiline="false">' +
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
					$this.updateView(value);
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
					type = options.type || optionsDefault.type,
					locale = AngularWidgets.locales[options.locale] || AngularWidgets.locales.en;
							
				optionsDefault.decimalSeparator = locale.number.decimalSeparator;
				optionsDefault.groupSeparator = locale.number.groupSeparator;

				if (type === 'currency') {
					optionsDefault.symbol = locale.number.currencySymbol;
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
						','	: [widgetBase.keyCode.COMMA],
						'.' : [widgetBase.keyCode.DOT, widgetBase.keyCode.NUMPAD_DOT],
					}
					
					this.options.decimalSeparatorKeyCodes = keyCodes[this.options.decimalSeparator];
				}
			},

			addBehaviour: function() {

				var $this = this;
				
				this.input.hover(function() {
					if (!$this.element.hasClass('ui-state-active') && !$this.element.hasClass('ui-state-disabled')) {
                        $this.element.addClass('ui-state-hover');
                    }
				}, function () {
                    if (!$this.element.hasClass('ui-state-active')) {
                        $this.element.removeClass('ui-state-hover');
                    }
                });

        		this.input.focus(function () {
        			if (!$this.element.hasClass('ui-state-disabled')) {
                        $this.element.addClass('ui-state-focus');
                    }        			
                });
        		this.input.blur(function () {
        			$this.element.removeClass('ui-state-focus');
                });
         				

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
				this.input.bind('blur', function(e) {
					$this.onBlur(e);
				});

			},
			
			onKeypress: function (e) {

				var char = '',
					keyCode = e.which || e.keyCode,
					char = String.fromCharCode(e.keyCode),
					inputValue = this.input.val();

 				// Decimal Separator
				if (this.options.allowDecimal && this.options.decimalSeparator === char) {
 					
 					console.log('decimal-separator pressed');			

					var dsIndexOf = inputValue.indexOf(this.options.decimalSeparator);

					// Verify if exists another decimal separator
 					if (dsIndexOf !== -1) { 						
						
						var caretPosition = getCaretPosition(this.input[0]); 					
 						
 						this.input.val(inputValue.replace(this.options.decimalSeparator, ''));

 						if (caretPosition > dsIndexOf) {
 							caretPosition--;
 						}

 						setCaretPosition(this.input[0], caretPosition);
 					}

 					return;
 				} 				
 				// Negative handle
 				else if (char === "-" && inputValue.indexOf('-') === -1 && this.options.allowNegative) {
					
					console.log('negative pressed');

 					if (inputValue === '') {
 						return;
 					}
					
					var caretPosition = getCaretPosition(this.input[0]);
 					
 					this.input.val('-' + this.input.val())					

 					setCaretPosition(this.input[0], ++caretPosition);

 					preventDefault(e);
 				}
 				// Positive handle
 				else if (char === "+" && inputValue.indexOf('-') !== -1) {

					console.log('positive pressed');

					var caretPosition = getCaretPosition(this.input[0]);
 					
 					this.input.val(this.input.val().replace('-', ''));

 					setCaretPosition(this.input[0], --caretPosition);

 					preventDefaultd(e);
 				}
 				// Not numeric handle
				else if (/[^0-9]/.test(char)) {

					console.log('not numeric pressed');

					preventDefault(e);
				}
 				else {
 					console.log('else=' + char);
 				}
				
				console.log('onKeypress=' + char);
				console.log('which=' + e.which + ', keyCode=' + e.keyCode + ', charcode=' + e.charCode);
				console.log('shift=' + e.shiftKey + ', ctrlkey=' + e.ctrlkey);
			},

			onKeydown: function(e) {

				var keyCode = e.which || e.keyCode;					
				
				console.log('onkeydown=' + keyCode);	
			},

			onKeyup: function(e) {

				var keyCode = e.which || e.keyCode;
			
				// Detect ctrl + v
				if (e.ctrlKey && keyCode === 86) {
									
 					var inputValue = this.input.val();
					var sign = '';
			
 					if (inputValue.indexOf('-') === 0) {
						sign = '-';
 					}
					
					var dsPatt = new RegExp("[\\" + this.options.decimalSeparator + "]", "g");

					// Remove decimal separator 
					var count = (inputValue.match(dsPatt, "g") || []).length

					while (count > 1) {
						inputValue = inputValue.replace(this.options.decimalSeparator, '');
						count--;
					}						
				
					var patt = new RegExp("[^\\d\\" + this.options.decimalSeparator + "]", "g");

					inputValue = sign + inputValue.replace(patt, '');
					
					console.log('paste=' + inputValue);
					
					this.input.val(inputValue);
				}
				
				console.log('keyup=' + e.which || e.keyCode)
				 								
				this.updateModel();
			},

			onBlur: function(e) {

				// Format number
				var val = this.input.val(),
					valueAsNumber = this.options.decimalPrecision !== null ? parseFloat(val).toFixed(this.options.decimalPrecision) : parseInt(val);
				
				this.updateView(valueAsNumber);
				this.updateModel();
			},

			updateView: function(value) {

				if (value === undefined || isNaN(value)) {
					value = null;
				}
					
				if (value === null || value === undefined || isNaN(value)) {
					this.input.val('');
				}
				else {
					this.input.val(value.toString());
				}
			},

			updateModel: function() {

				var val = this.input.val(),
					iof = val.indexOf(this.options.decimalSeparator),
					fix = iof !== -1 ? val.substr(iof).length -1 : 0,
					valueAsNumber = this.options.decimalPrecision !== null ? parseFloat(val).toFixed(fix) : parseInt(val);

				if (isNaN(valueAsNumber)) {
					valueAsNumber = null;
				}

				var parseValue = $parse(this.options.value);
				parseValue.assign(this.scope, valueAsNumber);

				this.scope.safeApply();
			},

			getValue: function() {
				return this.scope.$eval(this.options.value);
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
