
/*globals angular AngularWidgets*/

(function(window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
    	.factory('widgetDialog', ['$compile', '$timeout', '$parse', '$window', '$document', '$http', 'widgetBase', 'widgetFacet', DialogWidget])
    	.service('$puiDialog', ['widgetDialog', 'widgetConfirmdialog', DialogService])
    	.directive('wgDialog', ['widgetDialog', DialogDirective]);
	
	function DialogWidget($compile, $timeout, $parse, $window, $document, $http, widgetBase, widgetFacet) {

        var widget = {};
        
		widget.template = 	'<div class="pui-dialog-container">' +
								'<div class="pui-dialog ui-widget ui-widget-content ui-corner-all pui-shadow" role="dialog">' +
									'<div class="pui-dialog-titlebar ui-widget-header ui-helper-clearfix ui-corner-top"></div>' +
									'<div class="pui-dialog-content ui-widget-content" ng-transclude></div>' +
								'</div>' + 
							'</div>';
        
        widget.buildWidget = function(scope, element, attrs) {
        	return new widget.Dialog(scope, element, attrs);        	
        };

        widget.createWidget = function(scope, options, container, content) {

			var dialog = angular.element('<pui-dialog>' + content + '</pui-dialog>')
				.attr(options);			
			
			$compile(dialog)(scope);

			if (container) {
				container.append(dialog);
			}

			return dialog.data("$widget");
        }
                
    	widget.Dialog = widgetBase.createWidget({
        	
			optionsDefault: {
				width: null,
	            visible: false,
	            showEffect: null,
	            hideEffect: null,
	            effectOptions: {},
	            effectSpeed: 'normal',
	            closeOnEscape: true,
	            rtl: false,
	            closable: true,
	            buttons: null,
	            appendTo: null,
	            onAfterHide: null, 
	            onAfterShow: null,	            
	            onBeforeHide: null,
	            onBeforeShow: null,
	            onDismiss: null
			},

			init: function(options) {
			
				this.determineOptions(options);
				
				this.id = this.element.attr('id');
				
				if(!this.id) {
					this.id = this.element.uniqueId().attr('id');
				}
			
				// Clear attributes
				this.element.removeAttr('title');

				// elements
				this.dialog = this.element.childrenSelector('.pui-dialog');
				this.content = this.dialog.childrenSelector('.pui-dialog-content');
				this.titlebar = this.dialog.childrenSelector('.pui-dialog-titlebar');
				this.title = this.titlebar.append('<span id="' +  this.id + '_label" class="pui-dialog-title">' + this.options.title + '</span>');
				
				if (this.options.width) {
					this.dialog.addClass(this.options.width);					
				}

				this.determineTransclude();

				var $this;

				if (this.facets) {					
					this.renderFooterIfNecessarily();					
				}

				if (this.options.appendTo) {
					if (this.options.appendTo === '@body') {
						this.element.appendTo($document[0].body);
					}
					else {
						this.element.appendTo(angular.element(this.options.appendTo));
					}
				}

				if (this.options.rtl) {
					this.dialog.addClass('pui-dialog-rtl');
				}

				var $this = this;

				if(this.options.closable) {
					this.renderCloaser(); 					
				}

// 				this.blockEvents = 'focus.puidialog mousedown.puidialog mouseup.puidialog keydown.puidialog keyup.puidialog';            
// 				this.parent = this.element.parent();

// 				//events
 				this.bindEvents();

 				//aria
 				this.applyARIA();

 				if (this.options.visible) {
					this.show();
 				}

				widgetBase.createBindAndAssignIfNecessary(this, "show,hide,toggle,isVisible"); 
			},

			applyARIA: function() {
				this.dialog.attr({
					'role': 'dialog',
					'aria-labelledby': this.element.attr('id') + '_title',
					'aria-hidden': !this.isVisible()
				});
			},

        	determineOptions: function (options) {
        		this.options = widgetBase.determineOptions(this.scope, this.optionsDefault, options, ['onAfterHide', 'onBeforeHide', 'onBeforeShow', 'onDismiss'], []);
            },

            determineTransclude: function () {    		    				
				this.facets = widgetFacet.determineFacetsOptions(this.content);
			},

			bindEvents: function() {
				
				var $this = this;

				if(this.options.closeOnEscape) {
					$document.bind('keydown', function(e) {
						
						var keyCode = widgetBase.keyCode,
							active = parseInt($this.element.css('z-index'), 10) === AngularWidgets.zindex;

						if(e.which === keyCode.ESCAPE && $this.isVisible() && active) {
							$this.dismiss();
						}
					});
				}
			},

			toggle: function() {
				if (this.isVisible()) {
					this.hide();
				}
				else {
					this.show();
				}
			},

			isVisible: function() {
				return this.element.css('display') === 'block';
			},

			show: function() {
				
				if(this.isVisible()) {
					return;
				}

				this.enableModality();
							
				angular.element($document[0].body).addClass('pui-dialog-open');

				if (this.onBeforeShow) {
					this.onBeforeShow();
				}

				if(this.options.showEffect) {
					
					var $this = this;

					this.element.show(this.options.showEffect, this.options.effectOptions, this.options.effectSpeed, function() {
						$this.postShow();
					});
				}    
				else {
					this.element.show();

					this.postShow();
				}		

				this.moveToTop();
			},

			postShow: function() {   

				if (this.options.afterShow) {
					this.options.afterShow();
				}

				this.element.attr({
					'aria-hidden': false,
					'aria-live': 'polite'
				});

				this.applyFocus();
			},

			hide: function() {
			
				if(!this.isVisible()) {
					return;
				}
				
				if (this.options.onBeforeHide) {
					this.options.onBeforeHide();
				}
				
				// TODO - Add effects
				if(this.options.hideEffect) {
					
					var $this = this;

					this.element.hide(this.options.hideEffect, this.options.effectOptions, this.options.effectSpeed, function() {
						$this.postHide();
					});
				}
				else {
					this.element.hide();

					this.postHide();
				}
				
				this.disableModality();

				var body = angular.element($document[0].body);

				if (body.childrenSelector('.pui-dialog-modal').length === 0) {
					body.removeClass('pui-dialog-open');					
				}
			},

			dismiss: function() {

				this.hide();	

				if (this.options.onDismiss) {
					this.options.onDismiss();
				}
			},

			postHide: function() {

				if (this.options.onAfterHide) {
					this.options.onAfterHide();
				}

				this.dialog.attr({
					'aria-hidden': true,
					'aria-live': 'off'
				});
			},

			enableModality: function() {
								
				this.modality = angular.element('<div id="' + this.id + '" class="pui-dialog-modal ui-widget-overlay"></div>')
					.css({ 'zIndex' : ++AngularWidgets.zindex })
					.appendTo($document[0].body);

				//Disable tabbing out of modal dialog and stop events from targets outside of dialog
// 				doc.bind('keydown.puidialog',
// 						function(event) {
// 							if(event.keyCode == $.ui.keyCode.TAB) {
// 								var tabbables = $this.content.find(':tabbable'), 
// 								first = tabbables.filter(':first'), 
// 								last = tabbables.filter(':last');

// 								if(event.target === last[0] && !event.shiftKey) {
// 									first.focus(1);
// 									return false;
// 								} 
// 								else if (event.target === first[0] && event.shiftKey) {
// 									last.focus(1);
// 									return false;
// 								}
// 							}
// 						})
// 						.bind(this.blockEvents, function(event) {
// 							if ($(event.target).zIndex() < $this.element.zIndex()) {
// 								return false;
// 							}
// 						});
			},

			disableModality: function(){
				this.modality.remove();
				this.modality = null;
				//$(document).unbind(this.blockEvents).unbind('keydown.dialog');
			},

			applyFocus: function() {

			},
				
			renderFooterIfNecessarily: function() {

				if (this.facets.footer) {
					
					this.footer = angular.element('<div class="pui-dialog-buttonpane ui-widget-content ui-helper-clearfix"></div>')
						.appendTo(this.dialog)
						.append(this.facets.footer.transclude());
				}
			},
						
			renderHeaderIcon: function(styleClass, icon) {
				return angular.element('<a class="pui-dialog-titlebar-icon ' + styleClass + ' ui-corner-all" href="#" role="button">' +
									'<span class="pui-icon fa fa-fw ' + icon + '"></span></a>').appendTo(this.titlebar);
			},

			renderCloaser: function() {

				var $this = this;

				this.cloaser = this.renderHeaderIcon('pui-dialog-titlebar-close', 'fa-close')
					.hover(function() {
						$this.cloaser.toggleClass('ui-state-hover');
					})
					.click(function(e) {
						$this.dismiss();
						e.preventDefault();
					});
			},

			moveToTop: function() {
            	this.element.css('z-index',++AngularWidgets.zindex);
        	},

        	destroy: function() {
        		this.element.remove();
        		this.scope.$destroy();
        	}
    	});
                
        return widget;
    }

    function DialogDirective(widgetDialog) {
        return {
            restrict: 'E',
            replace: true,            
			transclude: true,
			scope: true,
            template: widgetDialog.template,
            link: function (scope, element, attrs) {
            	widgetDialog.buildWidget(scope, element, attrs);
            }
        };
    }

	function DialogService(widgetDialog, widgetConfirmdialog) {
		
		this.showConfirmDialog = function (title, message, icon, yesLabel, noLabel) {
			return widgetConfirmdialog.showConfirmDialog(title, message, icon, yesLabel, noLabel);
		};
	}

}(window, document));