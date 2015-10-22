/*globals angular AngularWidgets*/

(function (window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
    	.factory('widgetTabview', ['$interpolate', '$compile', 'widgetBase', 'widgetTab', TabviewWidget ])
		.directive('wgTabview', ['widgetTabview', TabviewDirective ]);

	function TabviewWidget($interpolate, $compile, widgetBase, widgetTab) {

        var widget = {};
                
        widget.template = '<div class="pui-tabview ui-widget ui-widget-content ui-corner-all ui-hidden-container"> ' +
        					'<ul class="pui-tabview-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" ></ul>' +
        					'<div ng-transclude class="pui-tabview-panels"></div>' +
        				  '</div>';

        widget.buildWidget = function(scope, element, attrs) {
        	return new widget.Tabview(scope, element, attrs);
        };

        widget.create = function(scope, container, options) {
        	
        	var element = angular.element(this.template);
        	
        	container.append(element);
        	 
        	return new Tabview(scope, element, options);
        };
                
        widget.Tabview = widgetBase.createWidget({
        	
        	optionsDefault: {
	                activeIndex: 0,
	                orientation: 'top',
	                closeable: false,
	                onTabChange : null,
	                onTabClose : null,
	       	},

			init: function (options) {
				
				this.navContainer = this.element.childrenSelector('ul');
	            this.panelContainer = this.element.childrenSelector('div');

				this.determineOptions(options);
				this.determineTransclude();
				
				this.element.addClass('pui-tabview-' + this.options.orientation);
				
				var $this = this;
				
				if (this.element.attr('activeIndex')) {
					widgetBase.watchExpression(this.scope, this.element.attr('activeindex'), function(value) {
						$this.selectTab(value);
					});
				}
				
				for (var i=0, t=this.tabs.length; i<t; i++) {
					
					var tab = this.tabs[i];
					
					tab.nav = angular.element('<li class="ui-state-default ui-corner-top"></li>')
                    	.appendTo(this.navContainer);

					var navLink = angular.element('<a href="#">' + tab.header + '</a>')
						.appendTo(tab.nav);
										    
					widgetBase.watchExpression(this.scope, tab.element.attr('header'), function(nl) {			            
						return function(value) {
							nl.text(value);
						}
					}(navLink))
					
					if (this.options.closeable) {						
						tab.closer = angular.element('<span class="ui-icon ui-icon-close"></span>')
							.appendTo(tab.nav);
					}
								
                    tab.content = angular.element('<div class="pui-tabview-panel ui-widget-content ui-corner-bottom ui-helper-hidden"></div>')
						.appendTo(this.panelContainer)
						.append(tab.transclude());
				}
				
				this._selectTab(this.options.activeIndex);
						
				this.bindEvents();
				
	            widgetBase.createBindAndAssignIfNecessary(this, "selectTab,closeTab,getActiveIndex,getLength");
			},
			
	        determineOptions: function (options) {        			        		        		        	
	        	this.options = widgetBase.determineOptions(this.scope, this.optionsDefault, options, ['onTabChange','onTabClose']);
			},
			
			determineTransclude: function() {
	        	this.tabs = widgetTab.determineOptions(this.panelContainer);
	        },
	        
	        selectTab: function(index) {
	        	
	        	if (this.options.activeIndex == index) {
	        		return;
	        	}
	        	
	        	this._selectTab(index);
	        },
	        
	        _selectTab: function(index) {
	        	
	        	if (index in this.tabs) {
	        	
		        	var oldTab = this.activeTab;
		        	var newTab = this.tabs[index];
		        	
		        	this.options.activeIndex = index;
		        	
		            var $this = this;
		            	            
		            // aria
		            if (oldTab) {
		            	oldTab.content.attr('aria-hidden', true);
		            	oldTab.nav.attr('aria-expanded', false);
		            }
		            
		            newTab.content.attr('aria-hidden', false);
		            newTab.nav.attr('aria-expanded', true);
	
		            if(this.options.effect) {
		            	/* TODO - Implementar os efeitos */
		            	if (oldTab) {
		            		oldTab.content.hide(this.options.effect.name, null, this.options.effect.duration, function() {
		            			oldTab.nav.removeClass('ap-tabview-selected ui-state-active ui-state-hover');
		            			$this.showNewTabWithEffect(newTab);	            			
			                });
		            	}
		            	else {
		            		this.showNewTabWithEffect(newTab);
		            	}
		            }
		            else {
		            	if (oldTab) {
		            		oldTab.nav.removeClass('ap-tabview-selected ui-state-active');
		            		oldTab.content.hide();
		            		
		            		this.showNewTabWithoutEffect(newTab);
		            	}
		            	else {
		            		this.showNewTabWithoutEffect(newTab);
		            	}
		            	
		            	// skip in first call
		            	if (this.activeTab && this.options.onTabChange) {
		            		this.options.onTabChange(this.bindInstance, index);
		            	}
		            }
		            
		            this.activeTab = newTab;
	        	}
	        },
	        
	        showNewTabWithEffect: function (newTab) {
	        	
	        	var $this = this;
	        	
	        	newTab.nav.removeClass('ui-state-hover').addClass('ap-tabview-selected ui-state-active');
                newTab.content.show($this.options.effect.name, null, $this.options.effect.duration, function() {
                	
                	// skip in first call
	            	if ($this.activeTab && $this.options.onTabChange) {
	            		$this.options.onTabChange($this.bindInstance, $this.options.activeIndex);
	            	}
                });
	        },
	        
	        showNewTabWithoutEffect: function (newTab) {
                newTab.nav.removeClass('ui-state-hover').addClass('ap-tabview-selected ui-state-active');
                newTab.content.show();	        	
	        },
	        
	        getTabIndex: function(tab) {
	        	
	        	for (var i=0; i<this.tabs.length; i++) {
	        		if (tab === this.tabs[i]) {
	        			return i;
	        		}
	        	}
	        	
	        	return -1;
	        },
	        
	        bindEvents: function() {
	        	
	        	var $this = this;
	        	
	            for (var i = 0; i < this.tabs.length; i++) {

	            	var tab = this.tabs[i];
	            	var tabNav = this.tabs[i].nav;
	            		            	
	            	tabNav.bind('click', function (tab) {			            
						return function (e) {
		                    
		                	var target = e.target,
		                        linkTarget = target.nodeName === 'A',
		                        liElement = linkTarget ? e.target.parentElement : e.target,
		                        elem = angular.element(liElement);
		                		                	
		            		if (!angular.element(target).hasClass('ui-icon-close')
		            				&& !elem.hasClass('ui-state-disabled')) {
		            			
		            			var index = $this.getTabIndex(tab);
		            			
		                		$this.selectTab(index);
		                	}
		                    
		                    e.preventDefault();
		                }
					}(tab));

	                widgetBase.hoverAndFocus(tabNav);
	                
	                var tabCloser = this.tabs[i].closer;
	                
	                if (tabCloser) {
	                	tabCloser.bind('click', function (tab) {			            
							return function (e) {
                		
		                		var index = $this.getTabIndex(tab);
		                		
		                		$this.closeTab(index);                		
		                		
		 	                    e.preventDefault()
		                	}
						}(tab));
	                }	                
	            }
	        },
	        
	        closeTab: function(index) {    
	            
	        	if (index in this.tabs) {	
	        		
	        		if (this.getLength() == 1) {
	        			this.element.hide();
	        		}
	        		else if (index == this.options.activeIndex) {
	        			
	        			var newIndex = index == this.getLength() - 1 ? index - 1 : index + 1;
	        			
	        			this._selectTab(newIndex);
	        		}
	        			        			        		
	        		this.tabs[index].nav.remove();
	        		this.tabs[index].content.remove();
	        		this.tabs.splice(index, 1);
	        			        		
        			if (index <= this.options.activeIndex) {
        				this.options.activeIndex--;
        			}
	        		
	        		this.options.onTabClose && this.options.onTabClose(this.bindInstance, index);	        		
	        	}
	        },
	        
	        getLength: function() {
	            return this.tabs.length;
	        },

	        getActiveIndex: function() {
	            return this.options.activeIndex;
	        },
	        
	        markAsLoaded: function(panel) {
	            panel.data('loaded', true);
	        },

	        isLoaded: function(panel) {
	            return panel.data('loaded') === true;
	        },

	        disable: function(index) {
	        	if (index in this.tabs) {
	        		this.tabs[index].nav.addClass('ui-state-disabled');	
	        	}	        	
	        },

	        enable: function(index) {
	        	if (index in this.tabs){
	        		this.navContainer.children().eq(index).removeClass('ui-state-disabled');	
	        	}
	        }
        });
   
        return widget;
    };

    function TabviewDirective(widgetTabview) {
		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			scope: true,
			link: function(scope, element, attrs) {
				widgetTabview.buildWidget(scope, element, attrs);
			},			
		    template: widgetTabview.template
		 };
	}
    
}(window, document));