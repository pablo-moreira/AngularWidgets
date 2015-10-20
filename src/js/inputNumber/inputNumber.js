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
				type: 'integer', // integer (default), float, currency, percent
				locale: null,
				disabled: false,
				readonly: false,
				symbol: null, // locale for currency and % for percent
				symbolLocation: 'prefix', // prefix (default) or suffix
				groupSeparator: null, // "locale"
				decimalSeparator: null, // "locale"
				decimalPrecision: null, 
				allowNegative: true // false (default), true;
			},

			init: function(options) {
				
				this.value = null;
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
				
				if (this.options.symbol !== null && this.options.symbolLocation !== null) {

					this.symbolContainer = angular.element('<span class="pui-inputnumber-symbol">' + this.options.symbol + '</span>');

					if (this.options.symbolLocation === 'prefix') {
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

				if (type === 'float') {
					optionsDefault.decimalPrecision = 2;
				}			
				else if (type === 'currency') {
					optionsDefault.symbol = locale.number.currencySymbol;					
					optionsDefault.decimalPrecision = 2;
				}
				else if (type === 'percent') {
					optionsDefault.symbol = '%';
					optionsDefault.decimalPrecision = 2;
				}

				this.options = widgetBase.determineOptions(this.scope, optionsDefault, options, [], ['disabled']);

				if (this.options.decimalPrecision > 0) {
					this.options.allowDecimal = true;
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
				this.input.bind('focus', function(e) {
					$this.onFocus(e);
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

 					preventDefault(e);
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

				var keyCode = e.which || e.keyCode,
					KC = widgetBase.keyCode,
					keysToSkip = KC.ARROWS.concat([KC.HOME,KC.END]);

				console.log('keyup=' + e.which || e.keyCode)
			
				// Detect ctrl + v
				if (e.ctrlKey && keyCode === 86) {
									
 					var value = this.input.val();
										
					console.log('paste=' + value);

					this.input.val(this.clearValue(value));
				}
				else if (keysToSkip.contains(keyCode)) {
					preventDefault(e);
				}
				else {
					this.updateModel(this.getInputValueAsNumber());
				}				
			},

			clearValue: function(value) {

				var sign = '';
			
				if (value.indexOf('-') === 0) {
					sign = '-';
				}
					
				var dsPatt = new RegExp("[\\" + this.options.decimalSeparator + "]", "g");

				// Remove decimal separator 
				var count = (value.match(dsPatt, "g") || []).length

				while (count > 1) {
					value = value.replace(this.options.decimalSeparator, '');
					count--;
				}						
				
				var patt = new RegExp("[^\\d\\" + this.options.decimalSeparator + "]", "g");

				value = sign + value.replace(patt, '');
					
				return value
			},

			onBlur: function(e) {

				var	value = this.getInputValueAsNumber(this.options.decimalPrecision);
				
				this.updateModel(value);
				this.input.val(this.format(value, this.options.decimalPrecision, this.options.decimalSeparator, this.options.groupSeparator));
			},

			getInputValueAsNumber: function(decimalPrecision) {

				var val = this.input.val(),
					iof = val.indexOf(this.options.decimalSeparator),
					fix = decimalPrecision || (iof !== -1 ? val.substr(iof).length -1 : 0);
					
				return this.options.allowDecimal ? parseFloat(val).toFixed(fix) : parseInt(val);
			},

			onFocus: function(e) {
				this.input.val(this.clearValue(this.input.val()));
			},

			format: function(value, dp, ds, gs){
				
				var n = value, 
    				s = n < 0 ? "-" : "", 
    				i = parseInt(value = Math.abs(+value || 0).toFixed(dp)) + "", 
    				j = (j = i.length) > 3 ? j % 3 : 0;

				return s + (j ? i.substr(0, j) + gs : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + gs) + (dp ? ds + Math.abs(n - i).toFixed(dp).slice(2) : "");
			},

			updateView: function(value) {
					
				if (value === undefined || isNaN(value)) {
					value = null;
				}
				
				if (this.value !== value) {

					this.value = value;

					if (document.activeElement === this.input[0]) {
						this.input.val(value.toString());
					}
					else {
						this.input.val(this.format(value, this.options.decimalPrecision, this.options.decimalSeparator, this.options.groupSeparator));
					}
				}
			},

			updateModel: function(value) {
				
				if (isNaN(value)) {
					value = null;
				}

				if (this.value !== value) {

					this.value = value;

					var parseValue = $parse(this.options.value);
					parseValue.assign(this.scope, this.value);

					this.scope.safeApply();	
				}				
			},

			getValue: function() {
				return this.value;
			}
		});

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