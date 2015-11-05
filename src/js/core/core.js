(function(window, document, undefined) {
    "use strict";

	String.prototype.firstToLowerCase = function() {
		return this.charAt(0).toLowerCase() + this.slice(1);
	}

	String.prototype.firstToUpperCase = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}
	
	var configuration = {
		widgets: {}
	};	
    
    window.AngularWidgets = {
    	
    	version: "0.0.3",
    	
    	zindex: 10000,
    	
    	widgets: {},
    	
    	putWidget: function(id,widget) {
    		this.widgets[id] = widget;
    	},
    	
    	getWidget: function(id) {
    		return this.widgets[id];
    	},
    	
    	locales : {},
    	
    	locale : null,
    	
    	guid: function() {
    		return Math.floor((1 + Math.random()) * 0x10000)
    			.toString(16)
    			.substring(1);
    	},
    	
    	configure: function(configs) {
    		configuration = angular.merge(configuration, configs);
    	},
    	
    	configureWidget: function(widgetName, configs) {
    		
    		var newConfigs = { widgets: {} };
    		
    		newConfigs.widgets[widgetName] = configs;

    		this.configure(newConfigs);
    	},
    	
    	getConfiguration: function() {
    		return configuration;
    	},

    	isArray: function(array) {
			return angular.isArray(array);
		},

		isString: function(str) {
			return angular.isString(str);
		},

		isNumber: function(num) {
			return angular.isNumber(num);
		},

		isFunction: function(fct) {
			return angular.isFunction(fct);
		},

		equals: function(v1, v2) {
			return angular.equals(v1, v2);
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

    AngularWidgets.WidgetConfig = function(configurationDefault) {

		var configuration = configurationDefault;

    	this.configure = function(configs) {
    		configuration = angular.merge(configuration, configs);
    	}

    	this.getConfiguration = function() {
    		return configuration;
    	}
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

    AngularWidgets.inArray = function(a, item) {
		var i = a.length;
    	while (i--) {
	        if (a[i] === item) {
	            return true;
	        }
	    }
	    return false;
    };

	AngularWidgets.setCursorPosition = function (input, pos) {
 			
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

	AngularWidgets.getCursorPosition = function(input) {

		if (!input)
			return 0;

		if (input.selectionStart !== undefined) {
			return input.selectionStart;
		} 
		else if (document.selection) {
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

	AngularWidgets.preventDefault =	function(e) {
		//standard browsers
		if (e.preventDefault) { 
			e.preventDefault();
		} 
		// old internet explorer
		else {
			e.returnValue = false;
		}
	}

	AngularWidgets.isRelative = function(element, parent) {
		var elemParent = angular.element(element).parent()[0];
            	
		if (elemParent == undefined) {
			return false;
		}
		else if (elemParent == parent) {
			return true;
		}
		else {
			return this.isRelative(elemParent, parent);
		} 
	}

	AngularWidgets.isVisible = function(element, parent) {
		
		var elm = element;
		
		if (element.length) {
			elm = element[0];
		}
		
		return elm.offsetWidth > 0 || elm.offsetHeight > 0;
	}

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
				height: height,
				offset: {
					top: 0,
					left: 0
				}
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

		if (options.at[0] === "right") {
			basePosition.left += targetWidth;
		}
		else if (options.at[0] === "center") {
			basePosition.left += targetWidth / 2;
		}

		if (options.at[1] === "bottom") {
			basePosition.top += targetHeight;
		}
		else if (options.at[1] === "center") {
			basePosition.top += targetHeight / 2;
		}	

		if (options.my[0] !== "left" || options.my[1] !== "top") {

			var elm = angular.element(element).css({ 'visibility' : 'hidden', 'display' : 'block' });

			var elementDimensions = this.getDimensions(element);

			if (options.my[0] === "right") {
				basePosition.left -= elementDimensions.width;
			}
			else if (options.my[0] === "center") {
				basePosition.left -= elementDimensions.width / 2;
			}

			if (options.my[1] === "bottom") {
				basePosition.top -= elementDimensions.height;
			}
			else if (options.my[1] === "center") {
				basePosition.top -= elementDimensions.height / 2;
			}

			var elm = angular.element(element).css({ 'visibility' : 'visible', 'display' : 'block' });
		}			

		element.style.position = "absolute";
		element.style.left = basePosition.left + "px";
		element.style.top = basePosition.top + "px";
	};

    angular.module('angularWidgets', [])
    	.run(['$rootScope', AngularWidgetsRun])
    	.value('version', AngularWidgets.version);    	

	function AngularWidgetsRun($rootScope) {

        $rootScope.safeApply = function (fn) {

			var phase = $rootScope.$$phase;
            
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
    }
    
}(window, document));