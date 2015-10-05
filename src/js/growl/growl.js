/*globals angular AngularWidgets */

(function(window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('puiGrowl', ['$timeout', 'widgetBase', function ($timeout, widgetBase) {
       
    	var growlInternal = {};

        growlInternal.data =  {
            growlElement : undefined,
            options : {
                sticky: false,
                life: 3000
            }
        };


        growlInternal.widget = function(_growlElement) {
            this.data.growlElement = angular.element(_growlElement);
            this.data.growlElement.addClass("pui-growl ui-widget");
            angular.element(document.getElementsByTagName('body')).append(this.data.growlElement);
        };

        growlInternal.show = function(msgs) {

            angular.forEach(msgs, function(msg) {
                growlInternal.renderMessage(msg);
            });

        };

        growlInternal.renderMessage = function(msg) {
            var markup = '<div class="pui-growl-item-container ui-state-highlight ui-corner-all ui-helper-hidden" aria-live="polite">';
            markup += '<div class="pui-growl-item pui-shadow">';
            markup += '<div class="pui-growl-icon-close ui-icon ui-icon-closethick" style="display:none"></div>';
            markup += '<span class="pui-growl-image pui-growl-image-' + msg.severity + '" ></span>';
            markup += '<div class="pui-growl-message">';
            markup += '<span class="pui-growl-title">' + msg.summary + '</span>';
            markup += '<p>' + msg.detail + '</p>';
            markup += '</div><div style="clear: both;"></div></div></div>';

            var message = angular.element(markup);

            this.bindMessageEvents(message);

            this.data.growlElement.append(message);
            message.showAsBlock();
            // fadein()  //TODO;
        };

        growlInternal.bindMessageEvents = function(message) {
            var closer = message.findAllSelector(".pui-growl-icon-close");
            message.hover(function(e) {
                //message.childrenSelector(".pui-growl-icon-close").showAsBlock();
                closer.showAsBlock();
            }, function (e) {
                //message.childrenSelector(".pui-growl-icon-close").hide();
                closer.hide();
            });

            message.click(function(e) {
                e.preventDefault();
                growlInternal.removeMessage(message);
            });

            if (!growlInternal.data.options.sticky) {
                this.setRemovalTimeout(message);
            }
        };

        growlInternal.setRemovalTimeout = function(message) {
            var messageTimer = $timeout(function() {
                    growlInternal.removeMessage(message);
                }, growlInternal.data.options.life);

            message.data('timer', messageTimer);
        };

        growlInternal.removeMessage = function(message) {
            widgetBase.hideWithAnimation(message, function () {
                message.remove();
            });
        };

        growlInternal.clear = function()  {
            angular.forEach(this.data.growlElement.findAllSelector('.pui-growl-item-container'), function(message) {
                growlInternal.removeMessage(angular.element(message));
            });
        };

        var growl = {};

        var initializeGrowl = function () {
            var _growlElement = growlInternal.data.growlElement;
            if (_growlElement === undefined) {

                   angular.element(document.getElementsByTagName('body')).append('<div id="growl"></div>');
                    _growlElement = document.getElementById('growl');
                growlInternal.widget(_growlElement);
            }
        };

        growl.showInfoMessage = function (title, msg) {
            initializeGrowl();
            growlInternal.show([
                {severity: 'info', summary: title, detail: msg}
            ]);
        };

        growl.showWarnMessage = function (title, msg) {
            initializeGrowl();
            growlInternal.show([
                {severity: 'warn', summary: title, detail: msg}
            ]);
        };

        growl.showErrorMessage = function (title, msg) {
            initializeGrowl();
            growlInternal.show([
                {severity: 'error', summary: title, detail: msg}
            ]);
        };

        growl.setSticky = function(sticky) {
            if ( typeof sticky !== 'boolean') {
                throw new Error('Only boolean allowed as parameter of setSticky function');
            }
            growlInternal.data.options.sticky = sticky;
        };

        growl.setStickyRememberOption = function() {
            growlInternal.data.options.previousStickyValue = AngularWidgets.puiGrowl.options.sticky;
            this.setSticky(true);
        };

        growl.resetStickyOption = function() {
            this.setSticky(growlInternal.data.options.previousStickyValue);
        };

        growl.setLife = function(time) {
            if ( typeof time !== 'int') {
                throw new Error('Only int allowed as parameter of setSticky function');
            }
            growlInternal.data.options.life = time;
            initializeGrowl();
        };

        growl.clear = function() {
            initializeGrowl();
            growlInternal.clear();
        };

        return growl;

    }]);

}(window, document));