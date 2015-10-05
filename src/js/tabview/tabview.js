/*globals angular AngularWidgets*/

(function (window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetTabview', ['$interpolate', '$compile', 'widgetBase', 'widgetTab', 'contentLoadingService', function($interpolate, $compile, widgetBase, widgetTab, contentLoadingService) {

        var widget = {};
                
        widget.template = '<div class="pui-tabview ui-widget ui-widget-content ui-corner-all ui-hidden-container"> ' +
        					'<ul class="pui-tabview-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all" ></ul>' +
        					'<div ng-transclude class="pui-tabview-panels"></div>' +
        				  '</div>';

        widget.buildWidget = function(scope, element, attrs) {
        	return new Tabview(scope, element, attrs);
        };

        widget.create = function(scope, container, options) {
        	
        	var element = angular.element(this.template);
        	
        	container.append(element);
        	 
        	return new Tabview(scope, element, options);
        };
                
        function Tabview(scope, element, options) {
        	
			this.constructor = function (scope, element, options) {
				
				this.element = element;
				this.scope = scope;

				this.navContainer = this.element.childrenSelector('ul');
	            this.panelContainer = this.element.childrenSelector('div');

				this.determineOptions(options);
				this.determineTransclude();
				
				this.element.addClass('pui-tabview-' + this.options.orientation);
				
				var $this = this;
				
				if (this.element.attr('activeIndex')) {
					widgetBase.watchExpressionIfNecessary(this.scope, this.element.attr('activeindex'), function(value) {
						$this.selectTab(value);
					})
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
										
					var content = tab.element.contents();

                    tab.content = angular.element('<div class="pui-tabview-panel ui-widget-content ui-corner-bottom ui-helper-hidden"></div>')
						.appendTo(this.panelContainer)
						.append($compile(content)(this.scope));
						
					delete(tab.element);
				}
				
				this._selectTab(this.options.activeIndex);
						
				this.bindEvents();
				
	            widgetBase.createBindAndAssignIfNecessary(this, "selectTab,closeTab,getActiveIndex,getLength");
			};
			
	        this.determineOptions = function (options) {
        		
	        	this.options = {
	                activeIndex: 0,
	                orientation: 'top',
	                closeable: false,
	                onTabChange : null,
	                onTabClose : null,
	        	};
	        		        	
	        	widgetBase.determineOptions(this.scope, this.options, options, ['onTabChange','onTabClose']);
			};
			
			this.determineTransclude = function() {
	        	this.tabs = widgetTab.determineOptions(this.panelContainer);
	        };
	        
	        this.selectTab = function (index) {
	        	
	        	if (this.options.activeIndex == index) {
	        		return;
	        	}
	        	
	        	this._selectTab(index);
	        }
	        
	        this._selectTab = function(index) {
	        	
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
	        };
	        
	        this.showNewTabWithEffect = function (newTab) {
	        	
	        	var $this = this;
	        	
	        	newTab.nav.removeClass('ui-state-hover').addClass('ap-tabview-selected ui-state-active');
                newTab.content.show($this.options.effect.name, null, $this.options.effect.duration, function() {
                	
                	// skip in first call
	            	if ($this.activeTab && $this.options.onTabChange) {
	            		$this.options.onTabChange($this.bindInstance, $this.options.activeIndex);
	            	}
                });
	        };
	        
	        this.showNewTabWithoutEffect = function (newTab) {
                newTab.nav.removeClass('ui-state-hover').addClass('ap-tabview-selected ui-state-active');
                newTab.content.show();	        	
	        }
	        
	        this.getTabIndex = function(tab) {
	        	
	        	for (var i=0; i<this.tabs.length; i++) {
	        		if (tab === this.tabs[i]) {
	        			return i;
	        		}
	        	}
	        	
	        	return -1;
	        }
	        
	        this.bindEvents = function() {
	        	
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
	        };
	        
	        this.closeTab = function(index) {    
	            
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
	        };
	        
	        this.getLength = function() {
	            return this.tabs.length;
	        };

	        this.getActiveIndex = function() {
	            return this.options.activeIndex;
	        };
	        
	        this.markAsLoaded = function(panel) {
	            panel.data('loaded', true);
	        };

	        this.isLoaded = function(panel) {
	            return panel.data('loaded') === true;
	        };

	        this.disable = function(index) {
	        	if (index in this.tabs) {
	        		this.tabs[index].nav.addClass('ui-state-disabled');	
	        	}	        	
	        };

	        this.enable = function(index) {
	        	if (index in this.tabs){
	        		this.navContainer.children().eq(index).removeClass('ui-state-disabled');	
	        	}
	        };	
	        
			
			this.constructor(scope, element, options);
        };
   
        return widget;
    }]);
    
	angular.module('pje.ui').directive('puiTabview', ['widgetTabview', function (widgetTabview) {
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
	}]);

    angular.module('pje.ui').factory('contentLoadingService', ['$http', '$templateCache', '$log', function ($http, $templateCache, $log) {
        return {
            loadHtmlContents: function (url, callback) {
                $http.get(url, {cache: $templateCache}).success(function (response) {
                    callback(response);
                }).error(function () {
                        $log.error('Error loading file ' + url);
                    });

            }

        };
    }]);

}(window, document));