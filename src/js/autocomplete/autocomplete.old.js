
/*globals angular AngularWidgets*/

(function(window, document, undefined) {
    "use strict";

    angular.module('angularWidgets').factory('widgetAutocomplete', ['$timeout', '$parse', '$document', 'widgetBase', 'widgetInputText',
                      function ($timeout, $parse, $document, widgetBase, widgetInputText) {

        var widgetAutocomplete = {};

        widgetAutocomplete.determineOptions = function (scope, element, attrs) {
            var options = scope.$parent.$eval(attrs.binding) || {};
            options.minQueryLength = attrs.minQueryLength || options.minQueryLength || 2;
            if (attrs.completemethod) {

                options.completeMethod = scope.$parent.$eval(attrs.completemethod);
            }
            options.dropdown = attrs.dropdown || options.dropdown;
            options.scrollHeight = attrs.scrollheight || options.scrollHeight ;
            return options;
        };

        widgetAutocomplete.buildWidget = function (element, attrs, options) {
            var autocompleteData = {},
                children = element.children(),
                inputElement = AngularWidgets.tagSelectorSelection(children, 'INPUT'),
                panelElement = AngularWidgets.classSelectorSelection(children, 'pui-autocomplete-panel');

            autocompleteData.element = angular.element(inputElement[0]);
            autocompleteData.inputData = widgetInputText.buildWidget(autocompleteData.element, attrs, options);

            autocompleteData.panel = angular.element(panelElement[0]);
            autocompleteData.options = options;
            
            if(options.multiple) {
                element.wrap('<ul class="pui-autocomplete-multiple ui-widget pui-inputtext ui-state-default ui-corner-all">' +
                    '<li class="pui-autocomplete-input-token"></li></ul>');
                autocompleteData.inputContainer = element.parent();
                autocompleteData.multiContainer = autocompleteData.inputContainer.parent();
            }
            else {
                if (options.dropdown) {
                    autocompleteData.dropdownBtn = angular.element('<button type="button" class="pui-button ui-widget ui-state-default ui-corner-right pui-button-icon-only">' +
                        '<span class="pui-autocomplete-dropdown pui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="pui-autocomplete-dropdown pui-button-text">&nbsp;</span></button>');
                    element.after(autocompleteData.dropdownBtn);
                    element.removeClass('ui-corner-all').addClass('ui-corner-left');
                }
            }
            this.bindKeyEvents(autocompleteData);
            this.bindEvents(autocompleteData);

            return autocompleteData;
        };

        widgetAutocomplete.bindKeyEvents = function(autocompleteData) {
            var $this = this;

            autocompleteData.element.bind('keyup', function(e) {
                var keyCode = widgetBase.keyCode,
                    key = e.which,
                    shouldSearch = true;

                if(key === keyCode.UP ||
                    key === keyCode.LEFT ||
                    key === keyCode.DOWN ||
                    key === keyCode.RIGHT ||
                    key === keyCode.TAB ||
                    key === keyCode.SHIFT ||
                    key === keyCode.ENTER ||
                    key === keyCode.NUMPAD_ENTER) {
                    shouldSearch = false;
                }

                if(shouldSearch) {
                    var value = autocompleteData.element.val();

                    if(!value.length) {
                        $this.hide();
                    }

                    if(value.length >= autocompleteData.options.minQueryLength) {
                        if(autocompleteData.timeout) {
                            autocompleteData.timeout.cancel();
                        }

                        autocompleteData.timeout = $timeout(function() {
                            $this.search(autocompleteData, value);
                        }, autocompleteData.options.delay);
                    }
                }

            });

            autocompleteData.element.bind('keydown', function(e) {
                if (widgetAutocomplete.panelVisible(autocompleteData)) {
                    var items = autocompleteData.listContainer.children(),
                        keyCode = widgetBase.keyCode,
                        highlightedItem = AngularWidgets.filter(items, function(item) {
                            return angular.element(item).hasClass('ui-state-highlight');
                        })[0];

                    switch(e.which) {
                        case keyCode.UP:
                        case keyCode.LEFT:
                            var prev = angular.element(highlightedItem.previousElementSibling);

                            if(prev.length !== 0) {
                                angular.element(highlightedItem).removeClass('ui-state-highlight');
                                prev.addClass('ui-state-highlight');

                                if(autocompleteData.options.scrollHeight) {
                                    AngularWidgets.scrollInView(autocompleteData.panel[0], prev[0]);
                                }
                            }

                            e.preventDefault();
                            break;

                        case keyCode.DOWN:
                        case keyCode.RIGHT:
                            var next = angular.element(highlightedItem.nextElementSibling);

                            if(next.length !== 0) {
                                angular.element(highlightedItem).removeClass('ui-state-highlight');
                                next.addClass('ui-state-highlight');

                                if(autocompleteData.options.scrollHeight) {
                                    AngularWidgets.core.scrollInView(autocompleteData.panel[0], next[0]);
                                }

                            }

                            e.preventDefault();
                            break;

                        case keyCode.ENTER:
                        case keyCode.NUMPAD_ENTER:
                            angular.element(highlightedItem).triggerHandler('click');

                            e.preventDefault();
                            break;

                        case keyCode.ALT:
                        case 224:
                            break;

                        case keyCode.TAB:
                            angular.element(highlightedItem).triggerHandler('click');
                            //$this.hide();
                            break;
                    }

                }

            });
        };

        widgetAutocomplete.bindEvents = function(autocompleteData) {
            if (autocompleteData.options.dropdown) {
                widgetBase.hoverAndFocus(autocompleteData.dropdownBtn);

                autocompleteData.dropdownBtn.bind('mouseup', function(e) {
                    widgetAutocomplete.search(autocompleteData, '');
                    autocompleteData.element.triggerHandler("focus");
                });
            }

            $document.bind(
                "click",
                function (event) {
                    if (widgetAutocomplete.panelVisible(autocompleteData)) {
                        if (!angular.element(event.target).hasClass('pui-autocomplete-dropdown')) {

                            autocompleteData.panel.hide();
                        }
                    }
                });
        };

        widgetAutocomplete.unbindEvents = function(autocompleteData) {

            if (autocompleteData.options.dropdown) {
                widgetBase.resetHoverAndFocus(autocompleteData.dropdownBtn);

                autocompleteData.dropdownBtn.unbind('mouseup');
            }
        };

        widgetAutocomplete.panelVisible = function(autocompleteData) {
            return autocompleteData.panel.css('display') !== 'none' && !autocompleteData.panel.hasClass('ui-helper-hidden');
        };

        widgetAutocomplete.search = function (autocompleteData, value) {
            var query = autocompleteData.options.caseSensitive ? value : value.toLowerCase(),
                emptyQuery = value.length === 0,
                request = {
                    query: query
                };

            autocompleteData.timeout = undefined;

            if (angular.isArray(autocompleteData.options.completeMethod)) {
                var sourceArr = autocompleteData.options.completeMethod,
                    data = [];

                for (var i = 0; i < sourceArr.length; i++) {
                    var item = sourceArr[i],
                        itemLabel = item.label || item;

                    if (!autocompleteData.options.caseSensitive) {
                        itemLabel = itemLabel.toLowerCase();
                    }

                    if (emptyQuery || itemLabel.indexOf(query) === 0) {
                        data.push({label: sourceArr[i], value: item});
                    }
                }

                widgetAutocomplete.handleData(autocompleteData, data);
            }
            else {
                autocompleteData.options.completeMethod.call(this, request, function (data) {
                    widgetAutocomplete.handleData(autocompleteData, data);
                });
            }
        };

        widgetAutocomplete.handleData = function(autocompleteData, data) {
            var items = [],
                hidden = autocompleteData.panel.css('display') === 'none' || autocompleteData.panel.hasClass('ui-helper-hidden');

            autocompleteData.panel.html('');
            autocompleteData.listContainer = angular.element('<ul class="pui-autocomplete-items pui-autocomplete-list ui-widget-content ui-widget ui-corner-all ui-helper-reset"></ul>');
            autocompleteData.panel.append(autocompleteData.listContainer);

            for(var i = 0; i < data.length; i++) {
                var itemInUL = angular.element('<ul><li class="pui-autocomplete-item pui-autocomplete-list-item ui-corner-all"></li></ul>'),
                    item = itemInUL.childrenSelector('li');

                item.data(data[i]);

                if(autocompleteData.options.content) {
                    item.html(autocompleteData.options.content.call(this, data[i]));
                }
                else {
                    item.text(data[i].label);
                }

                autocompleteData.listContainer.append(item);
                items.push(item);
            }


            this.bindDynamicEvents(autocompleteData, items);

            if(items.length > 0) {
                items[0].addClass('ui-state-highlight');

                //adjust height
                if(autocompleteData.options.scrollHeight) {
                    var heightConstraint = hidden ? autocompleteData.panel.height() : autocompleteData.panel.children().height();

                    if(heightConstraint > autocompleteData.options.scrollHeight) {

                        autocompleteData.panel.height(autocompleteData.options.scrollHeight);
                    }
                    else {

                        autocompleteData.panel.css('height', 'auto');
                    }

                }

                if(hidden) {
                    this.show(autocompleteData);
                }
                else {
                    this.alignPanel(autocompleteData);
                }
            }
            else {
                autocompleteData.panel.hide();
            }

        };

        widgetAutocomplete.show = function(autocompleteData) {
            this.alignPanel(autocompleteData);

            autocompleteData.panel.show();
            autocompleteData.panel.removeClass('ui-helper-hidden');
        };

        widgetAutocomplete.hide = function(autocompleteData) {
            autocompleteData.panel.hide();
            autocompleteData.panel.css('height', 'auto');
        };

        widgetAutocomplete.alignPanel = function(autocompleteData) {
            var panelWidth = null,
                heightConstraint = null,
                panelVisible = this.panelVisible(autocompleteData);

            if (autocompleteData.options.multiple) {
                panelWidth = autocompleteData.element[0].offsetWidth;
                heightConstraint = autocompleteData.panel.children()[0].offsetHeight;
            } else {
                if(panelVisible) {
                    panelWidth = autocompleteData.panel.childrenSelector('.pui-autocomplete-items').offsetWidth;
                }
                else {
                    autocompleteData.panel.css({'visibility':'hidden','display':'block'});
                    panelWidth = autocompleteData.panel.childrenSelector('.pui-autocomplete-items')[0].offsetWidth;
                    heightConstraint = autocompleteData.panel[0].offsetHeight;
                    autocompleteData.panel.css({'visibility':'visible','display':'none'});
                }

                var inputWidth = autocompleteData.element[0].offsetWidth;
                if(panelWidth < inputWidth) {
                    panelWidth = inputWidth;
                }
            }

            //adjust height
            if(autocompleteData.options.scrollHeight) {
                if(heightConstraint > autocompleteData.options.scrollHeight) {
                    autocompleteData.panel[0].style.height = autocompleteData.options.scrollHeight + 'px';
                }
                else {
                    autocompleteData.panel[0].style.height = 'auto';
                }
            }

            autocompleteData.panel[0].style.width = panelWidth + 'px';
            autocompleteData.panel.position({
                my: 'left top',
                at: 'left bottom',
                of: autocompleteData.element
            });
        };

        widgetAutocomplete.highlightInList = function(items) {
            var $items = items;
            angular.forEach(items, function (item) {

                angular.element(item).bind('mouseenter', function() {

                    angular.forEach($items, function (itemPanel) {
                        angular.element(itemPanel).removeClass('ui-state-highlight');
                    });
                    item.addClass('ui-state-highlight');
                });

            });
        };

        widgetAutocomplete.bindDynamicEvents = function(autocompleteData, items) {
            var cachedResults = [];
            widgetAutocomplete.highlightInList(items);
            angular.forEach(items, function(item) {
                var value = item.data('label');
                item.bind('mousedown', function(e) {
                    if(autocompleteData.options.multiple) {

                        var tokenMarkup = '<ul><li class="pui-autocomplete-token ui-state-active ui-corner-all ">';
                        tokenMarkup += '<span class="pui-autocomplete-token-icon ui-icon ui-icon-close" ></span>';
                        tokenMarkup += '<span class="pui-autocomplete-token-label">' + value + '</span></li></ul>';

                        var itemElement = angular.element(tokenMarkup).children()[0];
                        angular.element(autocompleteData.inputContainer.children()[0]).after(itemElement);

                        angular.element(itemElement).childrenSelector('.pui-autocomplete-token-icon').bind('click', function() {
                            itemElement.remove();
                            if (autocompleteData.options.removeSelection) {
                                autocompleteData.options.removeSelection(value);
                            }
                        });

                        autocompleteData.element.val('').triggerHandler("focus");

                    }
                    else {

                        autocompleteData.element.val(value).triggerHandler("focus");


                    }
                    widgetAutocomplete.updateModel(autocompleteData, value);

                    widgetAutocomplete.hide(autocompleteData);

                });
                if (autocompleteData.options.forceSelection) {
                    cachedResults.push(value);

                }
            });

            if (autocompleteData.options.forceSelection) {
                autocompleteData.element.bind("blur", function (e) {
                    var idx = cachedResults.indexOf(autocompleteData.element.val());
                    if (idx === -1) {
                        autocompleteData.element.val("");
                        widgetAutocomplete.updateModel(autocompleteData, "");
                    }
                    widgetAutocomplete.hide(autocompleteData);

                });
            }
        };

        widgetAutocomplete.updateModel = function(autocompleteData, value) {
            var $scope = autocompleteData.element.scope(),
                ngModelController = autocompleteData.element.controller('ngModel');

            $scope.safeApply(function () {
                ngModelController.$setViewValue(value);
            });

            if (autocompleteData.options.addSelection) {
                autocompleteData.options.addSelection(value);
            }
            if (autocompleteData.options.makeSelection) {
                autocompleteData.options.makeSelection(value);
            }
        };

        widgetAutocomplete.enableDisable = function (autocompleteData, value) {
            if (value === true) {

                widgetAutocomplete.unbindEvents(autocompleteData);
                if(autocompleteData.options.dropdown) {
                    autocompleteData.dropdownBtn.addClass('ui-state-disabled');
                }
            } else {
                widgetAutocomplete.bindEvents(autocompleteData);
                if(autocompleteData.options.dropdown) {
                    autocompleteData.dropdownBtn.removeClass('ui-state-disabled');
                }
            }
        };

        widgetAutocomplete.addBehaviour = function(scope, autocompleteData) {
            widgetBase.hoverAndFocus(autocompleteData.element);

            if (scope.puiDisabled !== undefined) {
                widgetBase.watchPuiDisabled(scope, autocompleteData, widgetAutocomplete.enableDisable);
                widgetBase.watchPuiDisabled(scope, autocompleteData.inputData, widgetInputText.enableDisable);
            }
        };

        return widgetAutocomplete;

    }]);

        angular.module('angularWidgets').directive('wgAutocomplete', ['widgetAutocomplete', function (widgetAutocomplete) {
        var linkFn = function (scope, element, attrs) {
            var options = widgetAutocomplete.determineOptions(scope, element, attrs),
                autocompleteData = widgetAutocomplete.buildWidget(element, attrs, options);

            widgetAutocomplete.addBehaviour(scope, autocompleteData);
        };
        return {
            restrict: 'E',
            replace: true,
            scope: {
                value: '=value',
                puiDisabled: '=puiDisabled',
                rendered: '=rendered'
            },
            template: '<div class="pui-autocomplete-container"><input ng-model="value" class="pui-inputtext ui-widget ui-state-default"><div class="pui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden pui-shadow" style="z-index: 1000"></div></div>',
            link: linkFn
        };

    }]);

}(window, document));
