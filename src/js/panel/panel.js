(function (window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetPanel', ['widgetBase', function (widgetBase) {

        var widget = {};
        
        widget.template = '<div class="pui-panel ui-widget ui-widget-content ui-corner-all">' +
        				  	'<div class="pui-panel-titlebar ui-widget-header ui-helper-clearfix ui-corner-all"><span class="ui-panel-title"></span></div>' +
        					'<div ng-transclude class="pui-panel-content ui-widget-content"></div>' +
        				  '</div>';

        widget.buildWidget = function(scope, element, attrs) {
        	return new Panel(scope, element, attrs);        	
        };
        
        widget.create = function(scope, container, options) {
        	
        	var element = angular.element(this.template);
        	
        	container.append(element);
        	
        	return new Panel(scope, element, options);
        }; 
        
        function Panel(scope, element, options) {
        	
			this.constructor = function (scope, element, options) {
				
				this.element = element;
				this.scope = scope;

	            this.header = this.element.childrenSelector('.pui-panel-titlebar');
	            this.title = this.header.childrenSelector('.ui-panel-title');
	            this.content = this.element.childrenSelector('.pui-panel-content');
	            								
				this.determineOptions(options);
								
				var $this = this;
				
				if (this.element.attr('header')) {
					widgetBase.watchExpression(this.scope, this.element.attr('header'), function(value) {
						$this.setHeader(value);
					});
				}
								
	            if(this.options.closable) {	            	
	                this.closer = angular.element('<a class="pui-panel-titlebar-icon ui-corner-all ui-state-default" href="#"><span class="ui-icon ui-icon-closethick"></span></a>')
	                	.appendTo(this.header)
	                    .click(function(e) {
	                    	$this.close();
	                    	$this.scope.safeApply();
	                    	e.preventDefault();	                                	
	                    });
	            }
	            
	            if(this.options.toggleable) {
	                
	            	var icon = this.options.collapsed ? 'ui-icon-plusthick' : 'ui-icon-minusthick';
	                
	                this.toggler = angular.element('<a class="pui-panel-titlebar-icon ui-corner-all ui-state-default" href="#"><span class="ui-icon ' + icon + '"></span></a>')
	                	.appendTo(this.header)
                        .click(function(e) {
                        	$this.toggle();
                        	$this.scope.safeApply();
                        	e.preventDefault();	                                    
                        });
	                                
	                if(this.options.collapsed) {
	                    this.content.hide();
	                }
	            }
	            
	            this.bindEvents();
				
	            widgetBase.createBindAndAssignIfNecessary(this, "toggle,collapse,expand,isCollapsed,getHeader,setHeader,close,open,isClosed");
        	};
        	
	        this.determineOptions = function (options) {
        		
	        	this.options = {
					toggleable: false,
					toggleDuration: 'normal',
					collapsed: false,
					closed: false,
					closable: false,
					closeDuration: 'normal',
					openDuration: 'normal',
					header: ' ',
					onOpen: null,
					onToggle: null,
					onClose: null,					
	        	};
	        		        	
	        	widgetBase.determineOptions(this.scope, this.options, options, ['onToggle','onClose','onOpen']);
			};		
			
	        this.bindEvents = function() {
	        	this.header.childrenSelector('.pui-panel-titlebar-icon').hover(function() {
	        		angular.element(this).toggleClass('ui-state-hover');
	        	});
	        };
	        
	        this.close = function() {
	            
	        	var $this = this;
	            	            
	        	widgetBase.fadeOut(this.element, this.options.closeDuration, function() {
            		if ($this.options.onClose) {
            			$this.options.onClose($this.bindInstance);
            		}
	        	});
	            
	            this.options.closed = true;
	        };
	        
	        this.open = function () {
	        	
	        	var $this = this;
	            
	        	widgetBase.fadeIn(this.element, this.options.openDuration, function() {
            		if ($this.options.onOpen) {	            			
            			$this.options.onOpen($this.bindInstance);
            		}
                });
	            
	            this.options.closed = false;
	        };
	        
	        this.toggle = function() {
	            
	        	if(this.options.collapsed) {
	                this.expand();
	            }
	            else {
	                this.collapse();
	            }
	        };    
	        
	        this.expand = function() {
	            
	        	this.toggler
	        		.childrenSelector('.ui-icon')
	        		.removeClass('ui-icon-plusthick')
	        		.addClass('ui-icon-minusthick');
	            
	            var $this = this;
	            
	            this.options.collapsed = false;
	            
	            widgetBase.slideDown(this.content, this.options.toggleDuration, function() {
		            if ($this.options.onToggle) {
		            	$this.options.onToggle($this.bindInstance);
		            }
	            });
	        };

	        this.collapse = function() {
	        	
	        	this.toggler
	        		.childrenSelector('.ui-icon')
	        		.removeClass('ui-icon-minusthick')
	        		.addClass('ui-icon-plusthick');
	            
	        	var $this = this;
	            
	        	this.options.collapsed = true;
	        	
	        	widgetBase.slideUp(this.content, this.options.toggleDuration, function() {        		
	        		if ($this.options.onToggle) {
		            	$this.options.onToggle($this.bindInstance);
		            }
	            });
	        };  
	        	        
	        this.isCollapsed = function () {
	        	return this.options.collapsed;
	        };
	        
	        this.isClosed = function() {
	        	return this.options.closed;
	        };
	        
	        this.setHeader = function(text) {
	        	this.title.text(text);
	        };
	        
	        this.getHeader = function() {
	        	return this.title.text();
	        };
			        	        	
        	this.constructor(scope, element, options);
        }
        
//        var linkFn = function (scope, element, attrs) {
//            var withinPuiAccordion = element.parent().attr('pui-accordion') !== undefined,
//                withinPuiTabview = element.parent().hasClass('pui-tabview-panels');
//
//            if (withinPuiAccordion) {
//                widgetPanel.panelInAccordion(scope, element, attrs);
//            } else {
//                if (withinPuiTabview) {
//                    widgetPanel.panelInTabview(scope, element, attrs);
//                } else {
//                    widgetPanel.panelInStandaloneUsage(scope, element, attrs);
//                }
//            }
//
//        };
        
    	
        var widgetPanel = {};

        var determineOptions = function (scope, element, attrs) {

            var options = scope.$eval(attrs.binding) || attrs.binding || {};

            options.header = attrs.header || options.header;

            return options;

        };

        var isContentVisible = function (content) {
            return !content.hasClass('pui-hide');
        };


        var expandPanel = function (panelData) {
            if (!isContentVisible(panelData.content)) {
                if (panelData.options.toggleOrientation === 'horizontal') {
                    panelData.element.removeClass('pui-panel-collapsed-h');
                    panelData.element.css('width', panelData.orignalWidth);
                }
                widgetBase.showWithAnimation(panelData.content, function()  {
                    if (panelData.options.onStateChanged) {
                        panelData.options.onStateChanged();
                    }
                });
                if (panelData.toggler) {

                    panelData.toggler.children().toggleClass('ui-icon-plusthick').toggleClass('ui-icon-minusthick');
                }
            }
        };

        var collapsePanel = function (panelData) {
            if (isContentVisible(panelData.content)) {

                widgetBase.hideWithAnimation(panelData.content, function () {
                    if (panelData.options.toggleOrientation === 'horizontal') {
                        panelData.orignalWidth = panelData.element.css('width');
                        panelData.element.addClass('pui-panel-collapsed-h');

                    }
                    if (panelData.options.onStateChanged) {
                        panelData.options.onStateChanged();
                    }
                    panelData.toggler.children().toggleClass('ui-icon-plusthick').toggleClass('ui-icon-minusthick');
                });
            }
        };

        var programmaticCollapseSupport = function (scope, attrs, panelData) {
            if (panelData.options.collapsed !== undefined && attrs.binding.trim().charAt(0) !== '{') {
                scope.$watch(attrs.binding + '.collapsed', function (value) {
                    if (value === false) {
                        expandPanel(panelData);
                    }
                    if (value === true) {
                        collapsePanel(panelData);
                    }
                });
            }
        };

        var buildWidget = function (element, options) {
            var panelData = {};

//            panelData.element = element;
//            panelData.options = options;
//
//            if (options.header) {
//                element.prepend('<div class="pui-panel-titlebar ui-widget-header ui-helper-clearfix ui-corner-all"><span class="ui-panel-title">' +
//                    options.header + "</span></div>").removeAttr('title');
//            }
//
//            panelData.header = element.childrenSelector('.pui-panel-titlebar');
//            panelData.titleSpan = panelData.header.childrenSelector('.ui-panel-title');
//            panelData.content = element.childrenSelector('.pui-panel-content');

            if (options.toggleable) {
                var icon = options.collapsed ? 'ui-icon-plusthick' : 'ui-icon-minusthick';

                panelData.toggler = angular.element('<a class="pui-panel-titlebar-icon ui-corner-all ui-state-default" href="#"><span class="ui-icon ' + icon + '"></span></a>');
                panelData.titleSpan.after(panelData.toggler);
                panelData.toggler.click(function (e) {
                    if (isContentVisible(panelData.content)) {
                        collapsePanel(panelData);

                    } else {
                        expandPanel(panelData);
                    }
                    e.preventDefault();
                });

                widgetBase.hoverAndFocus(panelData.toggler);
                if (options.collapsed) {
                    panelData.content.hide();
                }
            }

            if (options.closable) {
                var closer = angular.element('<a class="pui-panel-titlebar-icon ui-corner-all ui-state-default" href="#"><span class="ui-icon ui-icon-closethick"></span></a>');
                panelData.titleSpan.after(closer);
                closer.click(function (e) {
                    element.remove();
                    if (panelData.options.onClose) {
                        panelData.options.onClose();
                    }
                    e.preventDefault();
                });
                widgetBase.hoverAndFocus(closer);
            }

            return panelData;

        };

        widgetPanel.panelInStandaloneUsage = function (scope, element, attrs) {
            var options = determineOptions(scope, element, attrs),
                panelData = buildWidget(element, options);

            programmaticCollapseSupport(scope, attrs, panelData);
            if (panelData.options.header) {               
                widgetBase.watchExpression(scope, widgetBase.getExpression(element, 'header'), function(newValue) {
                	panelData.titleSpan.text(newValue);
                });
            }

        };

        widgetPanel.panelInTabview = function (scope, element, attrs) {
            element.data('title', widgetBase.getExpression(element, 'header'));
        };
        
        return widget;
    }]);
    
    angular.module('pje.ui').directive('puiPanel', ['widgetPanel', function (widgetPanel) {
        return {
            restrict: 'E',
			transclude: true,
			scope: true,
			link: function(scope, element, attrs) {
				widgetPanel.buildWidget(scope, element, attrs);
			},
            template: widgetPanel.template,
            replace: true,
        };
    }]);
    
}(window, document));