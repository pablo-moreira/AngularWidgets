(function (window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
    	.factory('widgetMessages', ['widgetBase', MessagesWidget])
    	.factory('$wgMessages', ['widgetMessages', MessagesService])
    	.directive('wgMessages', ['widgetMessages', MessagesDirective])
    	.directive('form', ['widgetMessages', FormDirective]);
    
    function FormDirective(widgetMessages) {
    	return {
    		restrict: 'E',
    		require: '^form',
    		scope: {},
    		link: function(scope, element, attrs, form) {
			
				if (widgetMessages.watchFormErrors()) {
					scope.$watch(
						function() { 
							return form.$error; 
						}, 
						function(newVal) {
							widgetMessages.showFormErrors(form);
						},
						true
					);
				}
    		}
    	};
    }

    function MessagesWidget(widgetBase) {

		AngularWidgets.configureWidget('messages', {
			closeable: true
		});
    	
        var widget = {},
        	messagesItems = [],
        	validationErrorHandlers = {};        	
        
        widget.template = '<div class="pui-messages-container"></div>';

        widget.buildWidget = function(scope, element, attrs) {
        	return new widget.Messages(scope, element, attrs);        	
        };
        
        widget.create = function(scope, container, options) {
        	
        	var element = angular.element(this.template);
        	
        	container.append(element);
        	
        	return new widget.Messages(scope, element, options);
        };
        
        widget.Messages = widgetBase.createWidget({

			init: function (options) {
       			
				this.determineOptions(options);
				
				this.info = this.createGroupBySeverity('info');
				this.warn = this.createGroupBySeverity('warn');
				this.error = this.createGroupBySeverity('error');
				this.groups = [this.info, this.warn, this.error];
					            
	            this.bindEvents();

	            messagesItems.push(this);
        	},
	        
        	determineOptions: function (options) {	        		        	
	        	this.options = widgetBase.determineOptions(this.scope, AngularWidgets.getConfiguration().widgets.messages, options, []);
			},
        	
        	createGroupBySeverity: function(severity) {
        		
        		var iconClass = {
						'info'	: 'fa-info-circle',
						'warn'	: 'fa-warning',
						'error'	: 'fa-close'
					},
        			group = {};
        		
        		group.container = angular.element('<div class="pui-messages ui-widget ui-corner-all"></div>')
        			.addClass('pui-messages-' + severity)
        			.appendTo(this.element);
        		
	            if (this.options.closeable) {
	            	group.closer = angular.element('<a href="#" class="pui-messages-close"><i class="fa fa-close"></i></a>').appendTo(group.container);
	            }	
	            
        		group.icon = angular.element('<span class="pui-messages-icon fa fa-2x"></span>').appendTo(group.container).addClass(iconClass[severity]),
        		group.list = angular.element('<ul></ul>').appendTo(group.container);

        		return group;
        	},

            bindEvents: function() {
                
            	var $this = this;

                if(this.options.closeable) {

                	angular.forEach(this.groups, function(group) {
                		group.closer.click(function(e) {
                			group.container.hide();                            
                            e.preventDefault();
                        });	
                	});
                }
            },
            
            showInfoMessage: function(summary, detail) {
            	this.showMessage({ severity: 'info', summary: summary, detail: detail });
            },
            
            showWarnMessage: function(summary, detail) {
            	this.showMessage({ severity: 'warn', summary: summary, detail: detail });
            },
            
            showErrorMessage: function(summary, detail) {
            	this.showMessage({ severity: 'error', summary: summary, detail: detail });
            },
            
            showMessage: function(msgs) {

            	this.clear();
                
                msgs = AngularWidgets.isArray(msgs) ? msgs : [msgs];
				
				for(var i = 0; i < msgs.length; i++) {
                	this.renderMessage(msgs[i]);
				}
                
                this.element.show();
            },
                        
            renderMessage: function(msg) {
            	
            	var group = this.getGroupBySeverity(msg.severity);
            	
            	group.list.append('<li><span class="pui-messages-summary">' + msg.summary + '</span><span class="pui-messages-detail">' + msg.detail + '</span></li>');

            	group.container.show();
            },
            
            clear: function(severityContainer) {
            	
            	angular.forEach(this.groups, function(group) {
            		group.list.children().remove();
            		group.container.hide();
            	});
            	
                this.element.hide();
            },
        	
            getGroupBySeverity: function(severity) {
            	
            	var group = this[severity];
            	
            	if (group === undefined) {
            		group = this.info;
            	}
            	
            	return group;
            }            
       	});

		widget.showMessage = function(msgs) {
			angular.forEach(messagesItems, function(messagesItem) {
				messagesItem.showMessage(msgs);
			});
		}

       	widget.showInfoMessage = function(summary, detail) {
       		angular.forEach(messagesItems, function(messagesItem) {
       			messagesItem.showInfoMessage(summary, detail);
       		});
		};

        widget.showWarnMessage = function(summary, detail) {
       		angular.forEach(messagesItems, function(messagesItem) {
       			messagesItem.showWarnMessage(summary, detail);
       		});
        };
            	
		widget.showErrorMessage = function(summary, detail) {
       		angular.forEach(messagesItems, function(messagesItem) {
       			messagesItem.showErrorMessage(summary, detail);
       		});
		};
	
		widget.watchFormErrors = function() {
			return messagesItems.length > 0;
		}		

		widget.showFormErrors = function(form) {

			var msgs = [];

			for (var key in form.$error) {

				var keyItems = form.$error[key];

				for (var i=0,l=keyItems.length; i<l; i++) {
					
					var control = keyItems[i],
						validator = control.$validators[key];
						
					var detail = 'The field "' + keyItems[i].$name + '" is "' + key;

					msgs.push({ severity: 'error', summary: 'Validation', detail: detail });
				}
			}
			
			widget.showMessage(msgs);
		};

		widget.getValidationErrorHandlerByType = function(errorType) {
			return validationErrorHandlers[errorType];
		};

		widget.registerValidationErrorHandler = function(errorType, handler) {
			validationErrorHandlers[errorType] = handler;
		};
		
		function replaceParams(str, replacements) {
			return str.replace(/\{(\d+)\}/g, function() {
				return replacements[arguments[1]];
			});
		}	

		widget.registerValidationErrorHandler('required', function(control) {			
			return AngularWidgets.locale.validator.types.required;
		});

		widget.registerValidationErrorHandler('minlegth', function(control){
			
			var msg = AngularWidgets.locale.validator.types.minlegth;

			return replaceParams(msg, 2);
		});

		widget.registerValidationErrorHandler('maxlegth', function(control){
			
			var msg = AngularWidgets.locale.validator.types.maxlegth;

			return replaceParams(msg, 2);
		});
        
        return widget;
    }
    
    function MessagesDirective(widgetMessages) {
        return {
            restrict: 'E',
			transclude: true,
			scope: true,
			link: function(scope, element, attrs) {
				widgetMessages.buildWidget(scope, element, attrs);
			},
            template: widgetMessages.template,
            replace: true,
        };
    }
    
	function MessagesService(widgetMessages) {
		return {
			showInfoMessage: function(title, msg, options) {
				widgetMessages.showInfoMessage(title, msg, options);
			},
			showWarnMessage: function(title, msg, options) {
				widgetMessages.showWarnMessage(title, msg, options);
			},
			showErrorMessage: function(title, msg, options) {
				widgetMessages.showErrorMessage(title, msg, options);
			},
			clearMessages: function() {
				widgetMessages.clearMessages();
			}
		};
	}
    
}(window, document));