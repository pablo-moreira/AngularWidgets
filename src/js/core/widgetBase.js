(function(window, document, undefined) {
    "use strict";

	angular.module('angularWidgets').factory('widgetBase', ['$parse', '$interpolate', '$animate', '$q', '$http', '$wgConfig', WidgetBaseFactory]);

	function WidgetBaseFactory($parse, $interpolate, $animate, $q, $http, $wgConfig) {
    	
		AngularWidgets.FunctionDataSource = function (fctLoader) {

			// public 
			this.load = load;
			this.getRowCount = getRowCount;
			this.getData = getData;			

			// private
			var data = [];
			var onLoadData = null;

			function setData(d) {
				data = d;
			} 

			function load(request) {

				var deferred = $q.defer();

				try {
					var $this = this;

					fctLoader(request, function(data) {

						setData(data);

						deferred.resolve(request);						
					});					
				}
				catch (e) {
					this.deferred.reject({ 'request': request, 'error': e });
				}

				return customPromise(deferred.promise);
			}    	

			function getRowCount() {
				return data.length;
			}

			function getData() {
				return data;
			}
		}

		AngularWidgets.ArrayDataSource = function (allData) {
      	
			// public
			this.load = load
			this.allData = allData;
			this.getRowCount = getRowCount;
			this.getData = getData;

			// private
			var data = [];
			var filteredData = allData;			

			function load(request) {
				
				var deferred = $q.defer();

				try {
					data = [];
					filteredData = [];

					var filterDataCurrent = this.allData;

					if (request.filter) {        	

						// TODO - Implement more one predicates
						var filter = request.filter.predicates[0];

						for (var i = 0, t = filterDataCurrent.length; i < t; i++) {

							var item = filterDataCurrent[i],
								itemFieldValue; 

							if (filter.field === '*') {
								itemFieldValue = item;
							}
							else {
								itemFieldValue = item[filter.field];
							}

							itemFieldValue = itemFieldValue.toLowerCase();

							if (!filter.value) {
								filteredData.push(item);
							}
							else {
								if (filter.operator == 'start_with' && itemFieldValue.indexOf(filter.value) === 0) {
									filteredData.push(item);
								}
								else if (filter.operator == 'contains' && itemFieldValue.indexOf(filter.value) != -1) {
									filteredData.push(item);
								}
							}
						}

						filterDataCurrent = filteredData;

						var rowCount = filteredData.length,
							rows = request.pageSize || filteredData.length,    		
							page = request.first + rows;
					}
					else {

						var rowCount = this.allData.length,
							rows = request.pageSize || this.allData.length,    		
							page = request.first + rows;

						filteredData = this.allData;
					}            

					if (request.sorts && request.sorts.length) {

						var field = request.sorts[0].field;
						var order = request.sorts[0].order == "asc" ? 1 : -1;

						filteredData.sort(function(data1, data2) {

							var value1 = data1[field],
								value2 = data2[field],
								result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

							return (order * result);
						});
					}

					for (var i = request.first; i < (page) && i < rowCount; i++) {
						data.push(filteredData[i]);
					}
					
					deferred.resolve(request);
				}
				catch (e) {
					deferred.reject({ 'request': request, 'error': e });
				}

				return customPromise(deferred.promise);
			}

			function getRowCount() {
				return filteredData.length;
			}

			function getData() {
				return data;
			}
		};
		
		AngularWidgets.HttpDataSource = function (options) {
    
			// public
			this.url = options.url;
			this.method = options.method || $wgConfig.httpDataSource.httpMethod;
			this.load = load;
			this.parseRequest = options.parseRequest || $wgConfig.httpDataSource.parseRequest;
			this.parseResponse = options.parseResponse || $wgConfig.httpDataSource.parseResponse;
			this.getRowCount = getRowCount;
			this.getData = getData;

			// private
			var data = null;
			var loadedData = null;

			function load(request) {

				var $this = this;
				var deferred = $q.defer();

				$http[this.method](this.url, $this.parseRequest(request))
					.success(function(data) {

						loadedData = $this.parseResponse(data, request);
						
						deferred.resolve(request);
					})
					.error(function(data){
						deferred.reject({ 'request': request, 'error': data });
					});

				return customPromise(deferred.promise);
			};
			
			function getRowCount() {
				return loadedData.rowCount;
			}

			function getData() {
				return loadedData.rows;
			}
		};

		AngularWidgets.FakeHttpDataSource = function (options) {

			options.parseResponse = function(data, request) {

				var arrayDataSource = new AngularWidgets.ArrayDataSource(data.rows);

				arrayDataSource.load(request)
							
				return { 
					'rowCount': arrayDataSource.getRowCount(), 
					'rows': arrayDataSource.getData() 
				};
			}

			return new AngularWidgets.HttpDataSource(options);
		}

		function customPromise(promise) {

			promise.success = function(fn) {

				promise.then(function(response) {
					fn(response);
				});

				return promise;
			};

			promise.error = function(fn) {

				promise.then(null, function(response) {
					fn(response);
				});

				return promise;
			};

			return promise;			
		}
		    
    	var widgetBase = {};

    	widgetBase.getConfiguration = function() {
    		return $wgConfig;
    	}

    	widgetBase.verifyRequiredOptions = function(widget, requiredOptions) {

    		requiredOptions = angular.isArray(requiredOptions) ? requiredOptions : [requiredOptions];

    		angular.forEach(requiredOptions, function(requiredOption) {
    			if (!widget.element.attr(requiredOption)) {
    				throw new Error('The attribute ' + requiredOption + ' is required!');
    			}
    		});
    	}
    	    	
    	widgetBase.createWidget = function (widgetChild) {
			
 			var baseWidget = function(scope, element, options) {
 				this.scope = scope;
 				this.element = element;
 				this.init(options);
 				this.element.data('$widget', this);
 			};

 			baseWidget.prototype = widgetChild;

 			return baseWidget;
     	};
    	
    	widgetBase.createBindAndAssignIfNecessary = function(widget, properties) {

    		var arrayProperties = properties.split(",");
    		widget.bindInstance = {};
    		 
    		for (var i=0, t=arrayProperties.length; i<t; i++) {
    			widget.bindInstance[arrayProperties[i]] = widget[arrayProperties[i]].bind(widget);    			 
    		}
    		
    		if (widget.options.binding) {
    			var parseValue = $parse(widget.options.binding);
                parseValue.assign(widget.scope.$parent, widget.bindInstance);
                widget.scope.safeApply();
    		}

    		var id = widget.element.attr('id');

			if (id) {
				AngularWidgets.putWidget(id, widget.bindInstance);
			}
    	};
    	
    	widgetBase.determineOptions = function(scope, optionsDefault, optionsInline, fctOptions, expressions) {
    	
			expressions = expressions !== undefined ? expressions : [];
    	
        	var dynamicOptions = optionsInline.options ? scope.$eval(optionsInline.options) : {};
        	
        	var options = angular.extend({}, optionsInline, dynamicOptions);
    		
        	// Equalize options names and types
    		for (var optName in optionsDefault) {

    			// Equalize options names
    			var optNameLc = optName.toLowerCase();
		
    			if (optNameLc != optName && options[optNameLc]) {
    				options[optName] = options[optNameLc];
    				delete(options[optNameLc]);
    			}

				// Eval expressions
    			if (expressions.indexOf(optName) !== -1) {
					options[optName] = scope.$eval(options[optName]);
    			}

				// Equarlize options types
				if (options[optName] !== undefined) {

					var tod = typeof optionsDefault[optName];
					var toi = typeof options[optName];
					
					if (angular.isNumber(optionsDefault[optName])) {
						options[optName] = parseFloat(options[optName]);
					}
					else if (tod === 'boolean' && toi !== 'boolean') {
						options[optName] = (/^(true|1|yes)$/i).test(options[optName]);
					}					
				}
    		}

			options = angular.extend({}, optionsDefault, options);
			    		
    		if (fctOptions) {
	    		for (var i=0, t=fctOptions.length; i<t; i++) {
	    			var fctOption = fctOptions[i];
	    			if (options[fctOption] && angular.isString(options[fctOption])) {
    					options[fctOption] =  scope.$eval(options[fctOption]);
	    			}
	    		}
    		}

    		return options;
    	};

    	widgetBase.determineDataSource = function(value) {
			
			var dataLoader;

    		if (angular.isString(value)) {
				dataLoader = new AngularWidgets.HttpDataSource({url: value});
			} 
			else if (angular.isFunction(value)) {
				dataLoader = new AngularWidgets.FunctionDataSource(value);
			} 
			else if (value instanceof AngularWidgets.HttpDataSource || value instanceof AngularWidgets.ArrayDataSource) {
				dataLoader = value;
			} 
			else if (angular.isArray(value)) {
				dataLoader = new AngularWidgets.ArrayDataSource(value);
			} 
			else {
				dataLoader = new AngularWidgets.ArrayDataSource([value]);
			}

			return dataLoader;
    	}    	
    	widgetBase.extend = function(target, source) {
    		
    		target = target || {};
    		
    		for (var prop in source) {
   				target[prop] = source[prop];
    		}
    		
    		return target;   		
    	}; 	

    	widgetBase.isWindow = function (obj) {
    		  return obj && obj.document && obj.location && obj.alert && obj.setInterval;
    	};
    	
    	widgetBase.isArrayLike = function (obj) {
    	  if (obj == null || widgetBase.isWindow(obj)) {
    	    return false;
    	  }

    	  var length = obj.length;

    	  if (obj.nodeType === 1 && length) {
    	    return true;
    	  }

    	  return angular.isString(obj) || angular.isArray(obj) || length === 0 ||
    	         typeof length === 'number' && length > 0 && (length - 1) in obj;
    	};
    	
        widgetBase.hoverAndFocus = function (element) {
        	
        	var items = angular.isArray(element) || widgetBase.isArrayLike(element) ? element : [].concat(element);

        	angular.forEach(items, function (item) {

        		var elem = angular.element(item);

        		elem.hover(function () {
                    var $this = angular.element(this);
                    if (!$this.hasClass('ui-state-active') && !$this.hasClass('ui-state-disabled')) {
                        $this.addClass('ui-state-hover');
                    }
                }, function () {
                    var $this = angular.element(this);
                    if (!$this.hasClass('ui-state-active')) {
                        $this.removeClass('ui-state-hover');
                    }
                });


        		elem.focus(function () {
        			var $this = angular.element(this);
        			if (!$this.hasClass('ui-state-disabled')) {
                        $this.addClass('ui-state-focus');
                    }        			
                });

        		elem.blur(function () {
        			var $this = angular.element(this);
        			$this.removeClass('ui-state-focus');
                });
            });
        };
        
        widgetBase.mouseDownAndUp = function (element, onMouseupCallback) {
            
        	var items = angular.isArray(element) ? element : [].concat(element);
            
            angular.forEach(items, function (item) {
        
            	item.mousedown(function() {
            		if(!element.hasClass('ui-state-disabled')) {
            			element.removeClass('ui-state-hover').addClass('ui-state-active');
            		}
            	});
            	
            	item.mouseup(function(e) {
            		
            		element.removeClass('ui-state-active').addClass('ui-state-hover');
            		
            		if (onMouseupCallback) {
            			onMouseupCallback(e);
            		}
            	});            	
            });
        }
        
        widgetBase.onKeydownEnterOrSpace = function(element, onKeydownCallback) {
        	
        	var items = angular.isArray(element) ? element : [].concat(element);
            
            angular.forEach(items, function (item) {
        
            	item.bind('keydown', function(e) {
            		if(e.keyCode == widgetBase.keyCode.SPACE || e.keyCode == widgetBase.keyCode.ENTER || e.keyCode == widgetBase.keyCode.NUMPAD_ENTER) {	
            			onKeydownCallback(e);
            		}
            	});            	
            });            
        }
        

        widgetBase.supportHighlight = function (element) {
            var items = angular.isArray(element) ? element : [].concat(element);
            angular.forEach(items, function (item) {

                item.hover(function () {
                    var $this = angular.element(this);
                    $this.toggleClass('ui-state-highlight');
                });

            });

        };

        widgetBase.resetHoverAndFocus = function (element) {
        	element = angular.element(element);
            element.unbind("mouseenter");
            element.unbind("mouseleave");
            element.unbind("focus");
            element.unbind("blur");
        };

        widgetBase.hideWithAnimation = function(element, doneCallback) {
            $animate.addClass(element, 'pui-hide', doneCallback);           
        };

        widgetBase.showWithAnimation = function(element, doneCallback) {
            $animate.removeClass(element, 'pui-hide', doneCallback);
        };
        
        widgetBase.slideUp = function(element, duration, doneCallback) {
        	element.hide();
        	if (doneCallback) doneCallback();
        }
        
        widgetBase.slideDown = function(element, duration, doneCallback) {
        	element.show();
        	if (doneCallback) doneCallback();
        }
        
        widgetBase.fadeOut = function (element, duration, doneCallback) {
        	element.hide();
        	if (doneCallback) doneCallback();
        }
        
        widgetBase.fadeIn = function (element, duration, doneCallback) {
        	element.show();
        	if (doneCallback) doneCallback();
        }

        widgetBase.isVisible = function (element) {
        	return AngularWidgets.isVisible(element);
		}

        
    	widgetBase.watchExpression = function(scope, expression, watchFunction) {
    		    			
			var parsedExpression = $interpolate(expression),
				watches = [];

			angular.forEach(parsedExpression.expressions, function (part) {				
				watches.push(part);				
			}, watches);

			angular.forEach(watches, function(watchValue) {
				scope.$watch(watchValue, function (value) {
					watchFunction(parsedExpression(scope));
				});
			});

    		watchFunction(parsedExpression(scope));
       	};

        widgetBase.getExpression = function(element, property) {
           return element[0].attributes[property].value;
        };        

        widgetBase.keyCode = {
            BACKSPACE: 8,
            TAB: 9,
            SHIFT: 16,
            CTRL: 17,
            PLUS: 171,
            COMMA: 188,
            DASH: 189,
            DOT: 190,
            DELETE: 46,                        
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            END: 35,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_ADD: 107,
            NUMPAD_ENTER: 108,
            NUMPAD_SUBTRACT: 109,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,            
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,            
            SPACE: 32,
            ARROWS: [37,38,39,40],
			LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            NUMERICS: [48,49,50,51,52,53,54,55,56,57, 96,97,98,99,100,101,102,103,104,105]
        };

        widgetBase.filterOperator = {
        	IS_NULL : 'is_null',
        	IS_EMPTY : 'is_empty',
        	GREATER_EQUAL : 'ge',
        	GREATER_THAN : 'gt',
        	START_WITH : 'start_with',
            CONTAINS : 'contains',
        	END_WITH : 'end_with'
        };
        
        widgetBase.predicateOperator = {
        	AND : 'and',
        	OR : 'or'
        };

    	return widgetBase;
	}

}(window, document));