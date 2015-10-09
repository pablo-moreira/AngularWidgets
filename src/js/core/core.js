/*globals angular AngularWidgets */

(function(window, document, undefined) {
    "use strict";
    
    window.AngularWidgets = {
    	version: "0.0.1",
    	zindex: 100000,
    	widgets: {},
    	putWidget: function(id,widget) {
    		this.widgets[id] = widget;
    	},
    	getWidget: function(id) {
    		return this.widgets[id];
    	}
    };
    
    window.AW = function (id) {
       	return AngularWidgets.getWidget(id);
    };
  
    AngularWidgets.classSelectorSelection = function(elements, classSelector) {
        var result = [];
        angular.forEach(elements, function (child) {
        	
        	var element = angular.element(child);
        	
            if (element.hasClass(classSelector)) {
                this.push(element[0]);
            }
        }, result);

        return result;
    };

    AngularWidgets.tagSelectorSelection = function(elements, tagSelector) {
        var result = [];
        angular.forEach(elements, function (child) {
            if (child.nodeName === tagSelector) {
                result.push(child);
            }
        }, result);

        return result;
    };

    AngularWidgets.wrapAll = function (children, wrapNodeHtml) {
        var parent = angular.element(children[0]).parent(),
            wrapNode = angular.element(wrapNodeHtml)[0];

        angular.forEach(children, function (child) {
            wrapNode.appendChild(child);

        });
        parent[0].appendChild(wrapNode);
        //Error: A Node was inserted somewhere it doesn't belong.
        //children[0].parentNode.appendChild(wrapNode);
    };

    AngularWidgets.filter = function (collection, predicate) {
        var result = [];
        angular.forEach(collection, function(element) {
            if (predicate(element)) {
                result.push(element);
            }
        });
        return result;
    };

    AngularWidgets.scrollInView = function (container, item) {
        if (item.offsetTop > (container.offsetHeight + container.scrollTop)) {
            container.scrollTop = item.offsetTop - container.offsetHeight + item.offsetHeight;
        }
        if (item.offsetTop < container.scrollTop) {
            container.scrollTop = item.offsetTop;
        }
    };

    AngularWidgets.inArray = function(arr, item) {
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] === item) {
                return true;
            }
        }

        return false;
    };
    
    angular.module('pje.ui.config', []).value('pje.ui.config', {
            labelPrefix: 'lbl'
        });

    var angularService = angular.module('angular.service', ['ngAnimate']);

    angularService.factory('widgetBase', ['$parse', '$interpolate', '$animate', '$q', '$http', function ($parse, $interpolate, $animate, $q, $http) {
    
		AngularWidgets.FunctionDataLoader = function (fctLoader) {

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

		AngularWidgets.ArrayDataLoader = function (allData) {
      	
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
		
		AngularWidgets.HttpDataLoader = function (options) {
    
			// public
			this.url = options.url;
			this.method = options.method || "post";
			this.load = load;
			this.parseResponse = options.parseResponse || parseResponse;
			this.getRowCount = getRowCount;
			this.getData = getData;

			// private
			var data = null;
			var loadedData = null;

			function load(request) {

				var $this = this;
				var deferred = $q.defer();

				$http[this.method](this.url, request)
					.success(function(data) {

						loadedData = $this.parseResponse(data, request);
						
						deferred.resolve(request);
						//$this.onLoadData(request);
					})
					.error(function(data){
						deferred.reject({ 'request': request, 'error': data });
					});

				return customPromise(deferred.promise);
			};

			function parseResponse(data, request) {
				return data;
			};

			function getRowCount() {
				return loadedData.rowCount;
			}

			function getData() {
				return loadedData.rows;
			}
		};

		AngularWidgets.FakeHttpDataLoader = function (options) {

			options.parseResponse = function(data, request) {

				var arrayDataLoader = new AngularWidgets.ArrayDataLoader(data.rows);

				arrayDataLoader.load(request)
							
				return { 
					'rowCount': arrayDataLoader.getRowCount(), 
					'rows': arrayDataLoader.getData() 
				};
			}

			return new AngularWidgets.HttpDataLoader(options);
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
    	
    	widgetBase.guid = function() {
    		return Math.floor((1 + Math.random()) * 0x10000)
    			.toString(16)
    			.substring(1);
    	};
    	
    	widgetBase.createWidget = function (widgetChild) {

    		var baseWidget = function (scope, element, options) {
            	this.scope = scope;
            	this.element = element;
            	this.init(options);
            };
    		
            baseWidget.prototype = widgetChild;

    		return baseWidget;
    	}
    	
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
    	
        	var options = angular.copy(optionsInline);

        	var dynamicOptions = options.options ? scope.$eval(options.options) : {};
        	
        	widgetBase.extend(options, dynamicOptions);
    		
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

    		widgetBase.extend(optionsDefault, options);
    		
    		if (fctOptions) {
	    		for (var i=0, t=fctOptions.length; i<t; i++) {
	    			var fctOption = fctOptions[i];
	    			if (optionsDefault[fctOption] && angular.isString(optionsDefault[fctOption])) {
    					optionsDefault[fctOption] =  scope.$eval(optionsDefault[fctOption]);
	    			}
	    		}
    		}
    	};

    	widgetBase.determineDataLoader = function(value) {
			
			var dataLoader;

    		if (angular.isString(value)) {
				dataLoader = new AngularWidgets.HttpDataLoader({url: value});
			} 
			else if (angular.isFunction(value)) {
				dataLoader = new AngularWidgets.FunctionDataLoader(value);
			} 
			else if (value instanceof AngularWidgets.HttpDataLoader || value instanceof AngularWidgets.ArrayDataLoader) {
				dataLoader = value;
			} 
			else if (angular.isArray(value)) {
				dataLoader = new AngularWidgets.ArrayDataLoader(value);
			} 
			else {
				dataLoader = new AngularWidgets.ArrayDataLoader([value]);
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
        			$this.addClass('ui-state-focus');
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
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            NUMPAD_ADD: 107,
            NUMPAD_DECIMAL: 110,
            NUMPAD_DIVIDE: 111,
            NUMPAD_ENTER: 108,
            NUMPAD_MULTIPLY: 106,
            NUMPAD_SUBTRACT: 109,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38
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
    }]);

    angular.module('pje.ui', ['pje.ui.config', 'angular.service']).run(['$rootScope', function ($rootScope) {

        $rootScope.safeApply = function (fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

    }]);

    angular.module('pje.ui').value('version', AngularWidgets.version);

    angular.forEach({
        hover: function hoverFn(element, fnEnter, fnLeave) {
            angular.element(element).bind('mouseenter', fnEnter).bind('mouseleave', fnLeave ||fnEnter);
        },
        focus: function focusFn(element, fn) {
            angular.element(element).bind('focus', fn);
        },
        blur: function blurFn(element, fn) {
            angular.element(element).bind('blur', fn);
        },
        mousedown: function mouseDownFn(element, fn) {
            angular.element(element).bind('mousedown', fn);
        },
        mouseup: function mouseUpFn(element, fn) {
            angular.element(element).bind('mouseup', fn);
        },
        click: function clickFn(element, fn) {
            angular.element(element).bind('click', fn);
        },
        clickWhenActive: function ClickActiveFn(element, fn) {
            angular.element(element).click(function(e) {
                var element = angular.element(e.target);
                if (!element.hasClass("ui-state-disabled") && !element.parent().hasClass("ui-state-disabled")) {
                    fn(e);
                }
            });
        },
        hide: function clickFn(element) {
            angular.element(element).css('display', 'none');
        },
        show: function clickFn(element) {
            angular.element(element).css('display', 'block');
        },
        showAsBlock: function clickFn(element) {
            // TODO animations
            angular.element(element).css('display', 'Block');
        },
        is: function isFn(element, tagName) {
            return element.nodeName.toLowerCase() === tagName;
        },
        childrenSelector: function childrenFn (element, selector) {
            var children = angular.element(element).children(),
                selectorType = selector.substring(0,1);

            if (children.length === 0) {
                return undefined;
            }

            if (selectorType === '.') {
                return AngularWidgets.classSelectorSelection(children, selector.substring(1));
            }
            return AngularWidgets.tagSelectorSelection(children, angular.uppercase(selector));
        },
        findAll: function findAllFn (element) {
            var result = [],
                children = angular.element(element).children();

            angular.forEach(children, function(child) {
                this.push(child);
                var items = angular.element(child).findAll();
                    angular.forEach(items, function(item) {
                        this.push(item);
                    }, this);
            }, result);
            return result;
        },
        findAllSelector: function(element, selector) {
            var allChildren = angular.element(element).findAll(),
                selectorType = selector.substring(0,1);

            if (allChildren.length === 0) {
                return allChildren;
            }

            if (selectorType === '.') {
                return AngularWidgets.classSelectorSelection(allChildren, selector.substring(1));
            }
            return AngularWidgets.tagSelectorSelection(allChildren, angular.uppercase(selector));
        },
        wrapContents: function wrapFn(element, wrapNodeHtml ) {
            var parent = angular.element(element),
                wrapNode = angular.element(wrapNodeHtml)[0],
                contents = parent.contents();

            angular.forEach(contents, function (child) {
              wrapNode.appendChild(child);
            });
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
            element.appendChild(wrapNode);
        },
        siblings: function siblingFn(element) {
            var n =  element.parentNode.firstChild,
                result = [];
            for ( ; n; n = n.nextSibling ) {
                if ( n.nodeType === 1 && n !== element ) {
                    result.push( n );
                }
            }
            return result;
        },
        position: function positionFn(element, options) {
            AngularWidgets.position.position(element, options);
        },
        height: function heightFn(element) {
            return AngularWidgets.position.getDimensions(element).height;
        },
        appendTo: function appendToFn(element, parent) {
        	angular.element(parent).append(element);
        	return element; 
        },
        prependTo: function prependToFn(element, parent) {
        	angular.element(parent).prepend(element);
        	return element; 
        },
        toggleClass : function toggleClassFn(element, styleClass) {
        	
        	var elem = angular.element(element);
        	
        	if (elem.hasClass(styleClass)) {
        		elem.removeClass(styleClass);
        	}
        	else {
        		elem.addClass(styleClass);
        	}
        	return elem;
        }
        

        

    }, function(fn, name) {
        /**
         * chaining functions
         */
        var jqLite = angular.element;
        jqLite.prototype[name] = function (arg1, arg2) {
            var value;
            for (var i = 0; i < this.length; i++) {
                if (value === undefined) {
                    value = fn(this[i], arg1, arg2);
                    if (value !== undefined) {
                        // any function which returns a value needs to be wrapped
                        value = jqLite(value);
                    }
                } else {
                    JQLiteAddNodes(value, fn(this[i], arg1, arg2));
                }
            }
            return value === undefined ? this : value;
        };


        AngularWidgets.position = {};

        AngularWidgets.position.regex = {

            rhorizontal: /left|center|right/,
            rvertical: /top|center|bottom/,
            roffset: /[\+\-]\d+(\.[\d]+)?%?/,
            rposition: /^\w+/,
            rpercent: /%$/
        };

        AngularWidgets.position.getDimensions = function (elem) {

        	// Get document width or height
        	if (elem.nodeType === 9) {
        		
        		var doc = elem.documentElement;

        		// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
                // unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
        		var name = 'Width';
                var width = Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
                
                name = 'Height';
                var height = Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name]);
                
                return {
                	width: width,
                	height: height
                };
        	}
        	else {        	
        		var clientRect = elem.getBoundingClientRect();
	            
        		return {
	                width: clientRect.width || (clientRect.right - clientRect.left),
	                height: clientRect.height || (clientRect.bottom - clientRect.top),
	                offset: {
	                    top: clientRect.top,
	                    left: clientRect.left
	                }
	            };
        	}
        };


        AngularWidgets.position.check = function (options) {
            // force my and at to have valid horizontal and vertical positions
            // if a value is missing or invalid, it will be converted to center
            angular.forEach([ "my", "at" ], function (item) {
                var pos = ( options[ item ] || "" ).split(" "),
                    regex = AngularWidgets.position.regex;

                if (pos.length === 1) {
                    pos = regex.rhorizontal.test(pos[ 0 ]) ?
                        pos.concat([ "center" ]) :
                        regex.rvertical.test(pos[ 0 ]) ?
                            [ "center" ].concat(pos) :
                            [ "center", "center" ];
                }
                pos[ 0 ] = regex.rhorizontal.test(pos[ 0 ]) ? pos[ 0 ] : "center";
                pos[ 1 ] = regex.rvertical.test(pos[ 1 ]) ? pos[ 1 ] : "center";

                // reduce to just the positions without the offsets
                options[ item ] = [
                    regex.rposition.exec(pos[ 0 ])[ 0 ],
                    regex.rposition.exec(pos[ 1 ])[ 0 ]
                ];
            });
        };

        AngularWidgets.position.position = function (element, options) {

            var targetWidth, targetHeight, basePosition, dimensions,
                target = options.of;

            dimensions = this.getDimensions(target[0]);
            this.check(options);

            targetWidth = dimensions.width;
            targetHeight = dimensions.height;
            basePosition = dimensions.offset;

            if (options.at[ 0 ] === "right") {
                basePosition.left += targetWidth;
            } else if (options.at[ 0 ] === "center") {
                basePosition.left += targetWidth / 2;
            }

            if (options.at[ 1 ] === "bottom") {
                basePosition.top += targetHeight;
            } else if (options.at[ 1 ] === "center") {
                basePosition.top += targetHeight / 2;
            }

            element.style.position = "absolute";
            element.style.left = basePosition.left + "px";
            element.style.top = basePosition.top + "px";
        };
    });
    
}(window, document));
