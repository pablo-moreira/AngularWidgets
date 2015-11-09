(function(window, document, undefined) {
	"use strict";

	angular.module('angularWidgets')
		.factory('wgGrowl', ['widgetBase', '$timeout', GrowlWidget])
		.factory('$wgGrowl', ['wgGrowl', GrowlService]);

	function GrowlWidget(widgetBase, $timeout) {

		AngularWidgets.configureWidget('growl', {
			appendTo: null,
			sticky: false,
			life: 3000
		});		
		
		var growl = {

			options: AngularWidgets.getConfiguration().widgets.growl,
			initialized: false,

			init: function (){

				var parent;

				if (this.options.appendTo !== undefined) {

					parent = angular.element(this.options.appendTo);

					if (parent.length === 1) {
						throw new Error('The element declared in options.appendTo is not found!');
					}
				}
				else {
					parent = angular.element(document.body);
				}

				this.container = angular.element('<div id="growl" class="pui-growl ui-widget"></div>')
					.appendTo(parent);

				this.initialized = true;
			},
					   
			initIfNecessarily: function () {				
				if (this.initialized === false) {
					this.init();					
				}				
			},

			show: function(msgs) {
				
				var $this = this;

				angular.forEach(msgs, function(msg) {
					$this.renderMessage(msg);
				});
			},

			renderMessage: function(msg) {
				
				var severity = {
					warn: 'fa-exclamation-triangle',
					info: 'fa-info-circle',
					error: 'fa-times-circle',
				};

				var icon = severity[msg.severity] ? severity[msg.severity] : 'fa-info-circle';

				var html =	'<div class="pui-growl-item-container ui-state-highlight ui-corner-all ui-helper-hidden" aria-live="polite">' +
								'<div class="pui-growl-item pui-shadow">' +
									'<div class="pui-growl-icon-close fa fa-close" style="display:none"></div>' +
									'<span class="pui-growl-image fa ' + icon + ' fa-2x" ></span>' +
									'<div class="pui-growl-message">' +
										'<span class="pui-growl-title">' + msg.summary + '</span>' +
										'<p>' + msg.detail + '</p>' +
									'</div>' +
									'<div style="clear: both;"></div>'+
								'</div>' + 
							'</div>';

				msg.element = angular.element(html);

				this.bindMessageEvents(msg);
				
				this.container.css('zIndex', ++AngularWidgets.zindex);
				this.container.append(msg.element);

				msg.element.showAsBlock();
			},

			bindMessageEvents: function(message) {

				var closer = message.element.findAllSelector(".pui-growl-icon-close");

				message.element.hover(function(e) {
					closer.show();
				}, 
				function (e) {
					closer.hide();
				});

				var $this = this;

				closer.click(function(e) {
					e.preventDefault();
					$this.removeMessage(message.element);
				});
				
				if (!(message.sticky === true || this.options.sticky === true)) {
					this.setRemovalTimeout(message);
				}
			},

			setRemovalTimeout: function(message) {
				
				var $this = this;

				var messageTimer = $timeout(function() {
					$this.removeMessage(message.element, true);
				}, message.life || this.options.life);

				message.element.data('timer', messageTimer);
			},
		   
			removeMessage: function(message, removedByTimer) {
				if (!removedByTimer) {
					$timeout.cancel(message.data('timer'));
				}
				message.hide();
				message.remove();
			},

			clearMessages: function()  {

				this.initIfNecessarily();
				
				angular.forEach(this.container.findAllSelector('.pui-growl-item-container'), function(item) {
					growl.removeMessage(angular.element(item));
				});
			},

			showInfoMessage: function (title, msg, options) {
				this.initIfNecessarily();
				this.show([this.createMessageItem('info', title, msg, options)]);
			},

			showWarnMessage: function (title, msg, options) {
				this.initIfNecessarily();
				this.show([this.createMessageItem('warn', title, msg, options)]);
			},

			showErrorMessage: function (title, msg, options) {
				this.initIfNecessarily();
				this.show([this.createMessageItem('error', title, msg, options)]);
			},

			createMessageItem: function (severity, title, msg, options) {				
				
				var item = {
					severity: severity, 
					summary: title, 
					detail: msg
				};

				options = options || {};

				return angular.extend(item, options);
			}
		};


		return growl;
	}
		
	function GrowlService(puiGrowl) {
		return {
			showInfoMessage: function(title, msg, options) {
				puiGrowl.showInfoMessage(title, msg, options);
			},
			showWarnMessage: function(title, msg, options) {
				puiGrowl.showWarnMessage(title, msg, options);
			},
			showErrorMessage: function(title, msg, options) {
				puiGrowl.showErrorMessage(title, msg, options);
			},
			clearMessages: function() {
				puiGrowl.clearMessages();
			}
		};
	}

}(window, document));