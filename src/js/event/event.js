/*globals window document angular */

(function (window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetEvent', [ function () {

        var widgetEvent = {};

        widgetEvent.determineOptions = function(scope, element, attrs) {
            var nodeName = element.parent()[0].nodeName,
                event = attrs.event;

            if (! event) {
                if (nodeName === 'INPUT') {
                    event = 'ngEnter';
                }
            }
            element.data("puiEvent", {event: event, callback: function () {
                console.log("event triggered");
                scope.actionListener();
            }});
        };

        return widgetEvent;

    }]);


    angular.module('pje.ui').directive('puiEvent', ['widgetEvent', function (widgetEvent) {
        var linkFn = function (scope, element, attrs) {
            widgetEvent.determineOptions(scope, element, attrs);

        };
        return {
            restrict: 'E',
            scope: {
                actionListener: '&actionlistener',
            },
            priority: 5,
            link: linkFn
        };

    }]);
}(window, document));