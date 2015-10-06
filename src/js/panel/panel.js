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