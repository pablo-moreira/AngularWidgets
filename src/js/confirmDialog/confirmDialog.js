(function(window, document, undefined) {
    "use strict";

	angular.module('angularWidgets')
		.factory('widgetConfirmdialog', ['$rootScope', '$compile', 'widgetBase', 'widgetDialog', ConfirmdialogWidget])
		.directive('wgConfirmdialog', ['widgetConfirmdialog', ConfirmdialogDirective]); 
	
	function ConfirmdialogWidget($rootScope, $compile, widgetBase, widgetDialog) {
		
		var widget = {};

		widget.template = '<div class="pui-confirmdialog"></div>';
		
		widget.buildWidget = function(scope, element, options) {
			return new widget.Confirmdialog(scope, element, options);  
		};

        widget.createWidget = function(scope, options, container) {
        	
			var confirmdialog = angular.element('<wg-confirmdialog></wg-confirmdialog>')
				.attr(options);
		
			$compile(confirmdialog)(scope);

			if (container) {
				confirmdialog.appendTo(container);
			}

			return confirmdialog.data('$widget');
        };

        widget.showConfirmDialog = function(title, message, icon, yesLabel, noLabel, parentScope) {

			var yesCallback,
				noCallback,
				dismissCallback,
				widget,
				scope = parentScope !== undefined ? parentScope.$new() : $rootScope.$new();
			
			scope.$yes = function yes() {				
				if (yesCallback) { 
					yesCallback();
				}
				destroy();
			};
			
			scope.$no = function no() {				
				if (noCallback) {
					noCallback();
				}
				destroy();
			};
			
			scope.$dismiss = function dismiss() {
				if (dismissCallback) {
					dismissCallback();
				}
				destroy();
			};
			
			function destroy() {
				widget.destroy();
				scope.$destroy();
			}

			var options = {
				'title': title,
				'message': message,
				'icon': icon,
				'yesAction': '$yes()',
				'noAction': '$no()',
				'dismissAction': '$dismiss()'
			};

			if (yesLabel) {
				options.yesLabel = yesLabel;
			}

			if (noLabel) {
				options.noLabel = noLabel;
			}

			widget = this.createWidget(scope, options, document.body);

			widget.show();

			return {
				onYes: function(fn) {
					yesCallback = fn;
					return this;
				},
				onNo: function(fn) {
					noCallback = fn;
					return this;
				},
				onDismiss: function(fn) {
					dismissCallback = fn;
					return this;
				}
			};
        };

		widget.Confirmdialog = widgetBase.createWidget({

			init: function (options) {
				
				// Validations
				widgetBase.verifyRequiredOptions(this, ['title', 'message']);

				this.options = {
					'id': this.element.attr('id') || AngularWidgets.guid(),
					'title': this.element.attr('title'),
					'width': 'pui-dialog-sm',
					'onDismiss' : '$dismissAction'
				};

				if (this.element.attr('binding')) {
					this.options.binding = this.element.attr('binding');
				}

				var yesLabel = this.element.attr('yesLabel') || AngularWidgets.locale.yesText,
					noLabel = this.element.attr('noLabel') || AngularWidgets.locale.noText,
					icon = this.element.attr('icon') || 'fa-question-circle';

				this.changeScope();
				
				var content =	'<span class="pui-confirm-dialog-severity pui-icon fa ' + icon + '"></span>' +
								'<span class="pui-confirm-dialog-message">' + this.element.attr('message') + '</span>' +
								'<wg-facet name="footer">' + 
									'<wg-button value="' + yesLabel + '" icon="fa-check" action="$yesAction()"></wg-button>' +
									'<wg-button value="' + noLabel + '" icon="fa-close" action="$noAction()"></wg-button>' +
								'</wg-facet>';

				this.dialogWidget = widgetDialog.createWidget(this.scope, this.options, this.element, content);
			},

			changeScope: function() {

				var $this = this;
		
				this.scope.$noAction = function() {

					AW($this.options.id).hide();

					if ($this.element.attr('noAction')) {
						$this.scope.$eval($this.element.attr('noAction'));
					}
				};

				this.scope.$yesAction = function() {

					AW($this.options.id).hide();

					if ($this.element.attr('yesAction')) {
						$this.scope.$eval($this.element.attr('yesAction'));
					}
				};

				this.scope.$dismissAction = function() {

					if ($this.element.attr('dismissAction')) {
						$this.scope.$eval($this.element.attr('dismissAction'));
					}
				};
			},

			show: function() {
				this.dialogWidget.show();
			},

			destroy: function() {
				this.dialogWidget.destroy();
				this.element.remove();
				this.scope.$destroy();
			}
		});
  
    	return widget;
	}

 	function ConfirmdialogDirective(widgetConfirmdialog) {
		return {
            restrict: 'E', 
            replace: true,
            template: widgetConfirmdialog.template,          
			scope: true,
            link: function (scope, element, attrs) {
				widgetConfirmdialog.buildWidget(scope, element, attrs);
            }
        };
    }
	    
}(window, document));