
/*globals angular AngularWidgets*/

(function(window, document, undefined) {
    "use strict";

	angular.module('pje.ui')
		.factory('widgetConfirmdialog', ['$compile', 'widgetDialog', ConfirmdialogWidget])
		.directive('puiConfirmdialog', ['widgetConfirmdialog', ConfirmdialogDirective]); 
	
	function ConfirmdialogWidget($compile, widgetDialog) {
		
		var widget = {};

		widget.template = '<div class="pui-confirmdialog"></div>';
		
		widget.build = function(scope, element, options) {

			// Validations
			if (!element.attr('title')) {
				throw new Error('The title options is required.');
			}

			if (!element.attr('message')) {
				throw new Error('The message options is required.');
			}

			var options = {
				'id': element.attr('id') || AngularWidgets.guid(),
				'title': element.attr('title'),
				'width': 'pui-dialog-sm',
				'onDismiss' : '$dismissAction'
			};

			if (element.attr('binding')) {
				options.binding = element.attr('binding');
			}

			var yesLabel = element.attr('yesLabel') || AngularWidgets.locale.yes,
				noLabel = element.attr('noLabel') || AngularWidgets.locale.no,
				icon = element.attr('icon') || 'fa-exclamation-triangle';

			scope.$noAction = function() {

				AW(options.id).hide();

				if (element.attr('noAction')) {
					scope.$eval(element.attr('noAction'));
				}
			};

			scope.$yesAction = function() {

				AW(options.id).hide();

				if (element.attr('yesAction')) {
					scope.$eval(element.attr('yesAction'));
				}
			};

			scope.$dismissAction = function() {

				if (element.attr('dismissAction')) {
					scope.$eval(element.attr('dismissAction'));
				}
			};

			var content =	'<span class="pui-confirm-dialog-severity pui-icon fa ' + icon + '"></span>' +
							'<span class="pui-confirm-dialog-message">' + element.attr('message') + '</span>' +
							'<pui-facet name="footer">' + 
								'<pui-button value="' + yesLabel + '" icon="fa-check" action="$yesAction()"></pui-button>' +
								'<pui-button value="' + noLabel + '" icon="fa-close" action="$noAction()"></pui-button>' +
							'</pui-facet>';						

			dialogWidget = widgetDialog.createWidget(scope, options, element, content);

			element.data('$widget', {
				
			});
        };

        widget.createWidget = function(scope, options) {
        	
			var dialog = angular.element('<pui-confirmdialog></pui-confirmdialog>');

			dialog.attr(options);
		
			$compile(dialog)(scope);

			return dialogElem.data('$widget');
        };
  
    	return widget;
	}

 	function ConfirmdialogDirective(widgetConfirmdialog) {
		return {
            restrict: 'E', 
            replace: true,
            template: widgetConfirmdialog.template,          
			scope: true,
            link: function (scope, element, attrs) {
				widgetConfirmdialog.build(scope, element, attrs);
            }
        };
    };
	    
}(window, document));