(function(window, document, undefined) {
    "use strict";

	var functions = {
    	uniqueId: function uniqueId(element, prepend) {
    		
			var id = prepend !== undefined ? prepend + "-" : '';
			id += AngularWidgets.guid();
    		
    		angular.element(element).attr('id', id);
    	},
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
    };

	angular.forEach(functions, function(fn, name) {
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
    });

}(window, document));