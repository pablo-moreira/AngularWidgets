(function (window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
    	.factory('widgetMessages', ['widgetBase', '$rootScope', MessagesWidget])
    	.factory('$wgMessages', ['widgetMessages', MessagesService])
    	.directive('wgMessages', ['widgetMessages', MessagesDirective])
    	.directive('form', ['widgetMessages', FormDirective]);
    
    function FormDirective(widgetMessages) {
    	return {
    		restrict: 'E',
    		require: '^form',
    		scope: {},
    		link: function(scope, element, attrs, ctrl) {			
				widgetMessages.registerForm({ 
					scope: scope, 
					element: element,
					attrs: attrs,
					ctrl: ctrl
				});				
    		}
    	};
    }

    function MessagesWidget(widgetBase, $rootScope) {

		AngularWidgets.configureWidget('messages', {
			closeable: true,
			clearOnRouteChange: true
		});
    	
        var widget = {},
        	messagesItems = [],
        	formItems = [],
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

				widget.registerMessagesItem(this);
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
            
            showMessages: function(msgs) {

            	this.clear();
                
				this.addMessages(msgs);
            },

            addMessages: function(msgs) {
                
                msgs = AngularWidgets.isArray(msgs) ? msgs : [msgs];
				
				for(var i = 0; i < msgs.length; i++) {
                	this.renderMessage(msgs[i]);
				}
            },
                        
            renderMessage: function(msg) {
            	
            	var group = this.getGroupBySeverity(msg.severity);
            	
            	group.list.append('<li><span class="pui-messages-summary">' + msg.summary + '</span><span class="pui-messages-detail">' + msg.detail + '</span></li>');

            	group.container.show();
            },

            isVisible: function() {
				
				var isVisible = false;

				for (var i=0,t=this.groups.length; i<t; i++) {
					if (widgetBase.isVisible(this.groups[i].container)) {
						isVisible = true;
						break;
					}
				}

				return isVisible;
            },
            
            clear: function(severityContainer) {
            	
            	angular.forEach(this.groups, function(group) {
            		group.list.children().remove();
            		group.container.hide();
            	});
            },
        	
            getGroupBySeverity: function(severity) {
            	
            	var group = this[severity];
            	
            	if (group === undefined) {
            		group = this.info;
            	}
            	
            	return group;
            }            
       	});

		widget.addMessages = function(msgs) {
			angular.forEach(messagesItems, function(messagesItem) {
				messagesItem.addMessages(msgs);
			});
		}

		widget.addInfoMessage = function(summary, detail) {
       		widget.addMessages([{ severity: 'info', summary: summary, detail: detail }]);
		};

        widget.addWarnMessage = function(summary, detail) {
       		widget.addMessages([{ severity: 'warn', summary: summary, detail: detail }]);
        };

		widget.addErrorMessage = function(summary, detail) {
       		widget.addMessages([{ severity: 'error', summary: summary, detail: detail }]);
		};

		widget.showMessages = function(msgs) {
			angular.forEach(messagesItems, function(messagesItem) {
				messagesItem.showMessages(msgs);
			});
		};

		widget.showInfoMessage = function(summary, detail) {
       		widget.showMessages([{ severity: 'info', summary: summary, detail: detail }]);
		};

        widget.showWarnMessage = function(summary, detail) {
       		widget.showMessages([{ severity: 'warn', summary: summary, detail: detail }]);
        };

		widget.showErrorMessage = function(summary, detail) {
       		widget.showMessages([{ severity: 'error', summary: summary, detail: detail }]);
		};

		widget.isVisible = function() {

			var isVisible = false;
			
			for (var i=0, l=messagesItems.length; i<l; i++) {
				if (messagesItems[i].isVisible()) {
					isVisible = true;
					break;
				}
			}
						
			return isVisible;
		}

		widget.clearMessages = function() {
			angular.forEach(messagesItems, function(messagesItem) {
       			messagesItem.clear();
       		});
		}
	
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
					
					if (control.$touched) {
						msgs.push({ severity: 'error', summary: 'Validation', detail: detail });
					}
				}
			}
			
			widget.showMessages(msgs);
		};

		widget.getValidationErrorHandlerByType = function(errorType) {
			return validationErrorHandlers[errorType];
		};

		widget.registerForm = function(formItem) {
			formItems.push(formItem);
		};

		widget.registerMessagesItem = function(messagesItem) {
			messagesItems.push(messagesItem);
		}

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

		/* TODO */
		widget.initFormWatch = function() {
		
			if (widgetMessages.watchFormErrors()) {
				scope.$watch(function() { 
						return form.$error; 
					}, 
					function(newVal) {
						widgetMessages.showFormErrors(form);
					},
					true
				);
			}
		};
        
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
			addInfoMessage: function(title, msg) {
				widgetMessages.addInfoMessage(title, msg);
			},
			addWarnMessage: function(title, msg) {
				widgetMessages.addWarnMessage(title, msg);
			},
			addErrorMessage: function(title, msg) {
				widgetMessages.addErrorMessage(title, msg);
			},
			showInfoMessage: function(title, msg) {
				widgetMessages.showInfoMessage(title, msg);
			},
			showWarnMessage: function(title, msg) {
				widgetMessages.showWarnMessage(title, msg);
			},
			showErrorMessage: function(title, msg) {
				widgetMessages.showErrorMessage(title, msg);
			},			
			showMessages: function(msgs) {
				widgetMessages.showMessages(msgs);	
			},
			isVisible: function() {
				return widgetMessages.isVisible();
			},
			clearMessages: function() {
				widgetMessages.clearMessages();
			}
		};
	}
    
}(window, document));