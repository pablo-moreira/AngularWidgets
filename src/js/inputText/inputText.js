/*globals window document angular */

(function (window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetInputText', ['$interpolate', 'widgetBase', function ($interpolate, widgetBase) {


        var widgetInputText = {},
            eventsHelper = {};

        widgetInputText.determineOptions = function (scope, element, attrs) {

            var options = scope.$eval(attrs.binding) || attrs.binding || {};
            return options;

        };

        widgetInputText.buildWidget = function (element, attrs, options) {
            var inputData = {};

            if (!attrs.type) {
                element.attr('type', 'text');
            }

            inputData.options = options;
            inputData.element = element;
            inputData.attrs = attrs;

            return inputData;
        };

        widgetInputText.enableDisable = function (inputData, value) {
        	widgetInputText.enableDisableStatic(inputData.element, value);
        };
        
        widgetInputText.enableDisableStatic = function (inputElement, value) {
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
        

        widgetInputText.showHide = function (inputData, value) {
            if (value === true) {
                inputData.element.removeClass("pui-hidden");
                widgetBase.showWithAnimation(inputData.element);
            } else {
                widgetBase.hideWithAnimation(inputData.element, function() {
                    inputData.element.addClass("pui-hidden");
                });
            }
        };

        widgetInputText.addBehaviour = function (scope, inputData) {

            widgetBase.hoverAndFocus(inputData.element);

            if (scope.puiDisabled !== undefined) {
                widgetBase.watchPuiDisabled(scope, inputData, widgetInputText.enableDisable);
            }
            if (scope.rendered !== undefined) {
                widgetBase.watchRendered(scope, inputData, widgetInputText.showHide);
            }
        };

        // TODO this should go in the core when used by more then 1 widget.

        eventsHelper.handleEnterKey = function (element, callback) {
            element.bind("keyup", function (e) {
                var keyCode = widgetBase.keyCode,
                    key = e.which;

                if (key === keyCode.ENTER) {
                    callback();
                    e.preventDefault();
                }
            });
        };

        widgetInputText.registerEvents = function (inputData) {
            var _events = inputData.element.findAllSelector('pui-event');
            angular.forEach(_events, function (event) {
                var puiEventData = angular.element(event).data('puiEvent');
                if (puiEventData.event === 'ngEnter') {

                    eventsHelper.handleEnterKey(inputData.element, puiEventData.callback);
                }

            });
            _events.remove();  // As events aren't graphic, they don't need to stay oin the HTML (but is is OK it not done)


        };

        return widgetInputText;

    }]);


    angular.module('pje.ui').directive('puiInputtext', ['widgetInputText', function (widgetInputText) {
        var linkFn = function (scope, element, attrs) {
            var options = widgetInputText.determineOptions(scope, element, attrs),
                inputData = widgetInputText.buildWidget(element, attrs, options);

            widgetInputText.addBehaviour(scope, inputData);
            widgetInputText.registerEvents(inputData);

        };
        return {
            restrict: 'E',
            scope: {
                value: '=value',
                puiDisabled: '=puiDisabled',
                rendered: '=rendered'
            },
            replace: true,
            transclude: true,
            template: '<input ng-model="value" class="pui-inputtext ui-widget ui-state-default ui-corner-all" role="textbox" aria-disabled="false" aria-readonly="false" aria-multiline="false" ng-transclude> ',
            link: linkFn
        };

    }]);
}(window, document));