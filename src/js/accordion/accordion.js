(function (window, document, undefined) {
    "use strict";

    angular.module('angularWidgets')
    	.factory('widgetAccordion', ['$compile', 'widgetBase', 'widgetTab', AccordionWidget ])
		.directive('wgAccordion', ['widgetAccordion', AccordionDirective ]);

	function AccordionWidget($compile, widgetBase, widgetTab) {

		AngularWidgets.configureWidget('accordion', {
			activeIndex: 0,
			multiple: false,
			showAnimation: 'fadeIn',
			hideAnimation: 'fadeOut',
			animationSpeed: 'normal',
			enableAnimation: true,
			onTabShow: undefined,
			onTabHide: undefined
		});
		
        var widget = {};
                
        widget.template = '<div class="pui-accordion ui-widget ui-helper-reset" ng-transclude></div>';

        widget.buildWidget = function(scope, element, attrs) {
        	return new widget.Accordion(scope, element, attrs);
        };

        widget.create = function(scope, container, options) {
        	
        	var element = angular.element(this.template);
        	
        	container.append(element);
        	 
        	return new Accordion(scope, element, options);
        };      

        widget.Accordion = widgetBase.createWidget({

			init: function (options) {
					        
	            var $this = this;
	               
	            this.determineOptions(options);
	            this.determineTransclude();
	            	            
				angular.forEach(this.tabs, function(tab, index) {

					tab.nav = angular.element('<h3 class="pui-accordion-header ui-helper-reset ui-state-default"><span class="pui-icon fa fa-fw"></span></h3>')
                    	.appendTo($this.element);

					tab.navLink = angular.element('<a href="">' + tab.header + '</a>').appendTo(tab.nav);

                    tab.content = angular.element('<div class="pui-accordion-content ui-helper-reset ui-widget-content"></div>')
						.appendTo($this.element)
						.append(tab.transclude());

					widgetBase.watchExpression($this.scope, tab.element.attr('header'), function(value) {
						tab.navLink.text(value);
					});
					
					if (tab.element.attr('id')) {
						tab.nav.attr('id', tab.element.attr('id') + '_header');
						tab.content.attr('id', tab.element.attr('id') + '_content');
					}

					if ($this.isActive(index)) {
						$this.activeTab(tab);
					}
					else {
						$this.inactiveTab(tab);
					}

                    $this.bindTabEvents(tab);
				});

				if (this.element.attr('activeIndex')) {
					widgetBase.watchExpression(this.scope, this.element.attr('activeindex'), function(value) {
						$this.selectTab(value);
					});
				}
	            				
	            widgetBase.createBindAndAssignIfNecessary(this, "getActiveIndex,getLength,isActive,getActiveIndex,selectTab,unselectTab");
			},
			
			bindTabEvents: function(tab) {
			
				var $this = this;
	            		            	
	            tab.nav.bind('click', function (e) {
	                
	                if(!tab.nav.hasClass('ui-state-disabled')) {
	                    
	                    var tabIndex = $this.getTabIndex(tab);

	                    if(tab.nav.hasClass('ui-state-active')) {
	                        $this.unselectTab(tabIndex);
	                    }
	                    else {
	                        $this.selectTab(tabIndex);
	                    }
	                }

	                e.preventDefault();          
				});

				widgetBase.hoverAndFocus(tab.nav);
	        },
			
			isActive: function(index) {
				return (this.options.multiple) ? AngularWidgets.inArray(this.options.activeIndex, index) : this.options.activeIndex === index;
			},
			
	        getLength: function() {
	            return this.tabs.length;
	        },

	        getActiveIndex: function() {
	            return this.options.activeIndex;
	        },

			getTabIndex: function(tab) {
	        	
	        	for (var i=0; i<this.tabs.length; i++) {
	        		if (tab === this.tabs[i]) {
	        			return i;
	        		}
	        	}
	        	
	        	return -1;
	        },
			
	        determineOptions: function (options) {        			        		        		        	
	        	
	        	this.options = widgetBase.determineOptions(this.scope, AngularWidgets.getConfiguration().widgets.accordion, options, ['onTabShow','onTabHide']);
	        	
				if (this.options.multiple && !AngularWidgets.isArray(this.options.activeIndex)) {
					this.options.activeIndex = [this.options.activeIndex];
				}
			},
			
			determineTransclude: function() {
	        	this.tabs = widgetTab.determineOptions(this.element);
	        },

	        /**
         	  *  Activates a tab with given index
              */
        	selectTab: function(index) {
				
				if (this.tabs[index] !== undefined) {

					var $this = this,
						tab = this.tabs[index];

					if (this.options.onTabShow) {
						this.options.onTabShow(this.bindInstance, index);
					}

					if (tab.options.onShow) {
						tab.options.onShow(this.bindInstance);
					}

					//update state
					if(this.options.multiple) {
						this.addToSelection(index);
					}
					else {

						if (this.tabs[this.options.activeIndex] !== undefined) {
							this.unselectTab(this.options.activeIndex);
						}

						this.options.activeIndex = index;
					}

					//activate selected
					this.activeTab(tab);

					tab.content.attr('aria-hidden', false);
					tab.content.show();
				}
			},

			/**
			 *  Deactivates a tab with given index
			 */
			unselectTab: function(index) {
				
				var tab = this.tabs[index];
				
				this.inactiveTab(tab);
								
				tab.content.hide(); /* TODO - Animation */

				if (this.options.onTabHide) {
					this.options.onTabHide(this.bindInstance, index);
				}

				if (tab.options.onHide) {
					tab.options.onHide(this.bindInstance);
				}
							
				this.removeFromSelection(index);				 
			},

			activeTab: function(tab) {

				tab.nav.attr('aria-expanded', true)
					.addClass('ui-state-active ui-corner-top')
					.removeClass('ui-state-hover ui-corner-all')
					.childrenSelector('.pui-icon')
						.addClass('fa-caret-down')
						.removeClass('fa-caret-right');
				
				tab.content.attr('aria-hidden', false);
			},

			inactiveTab: function(tab) {				
				tab.nav.attr('aria-expanded', false)
					.addClass('ui-corner-all')
					.removeClass('ui-state-active ui-corner-top')
					.childrenSelector('.pui-icon')
						.addClass('fa-caret-right')
						.removeClass('fa-caret-down');
				
				tab.content.attr('aria-hidden', true);
				tab.content.addClass('ui-helper-hidden');
			},

			addToSelection: function(index) {
            	this.options.activeIndex.push(index);
        	},

			removeFromSelection: function(index) {
				if (this.options.multiple) {
					this.options.activeIndex.splice(index, 1);
				}
				else {
					this.options.activeIndex = -1;
				}
			}
        });
   
        return widget;
    }

    function AccordionDirective(widgetAccordion) {
    	return {
			restrict: 'E',
			replace: true,
			transclude: true,
			scope: true,
			link: function(scope, element, attrs) {
				widgetAccordion.buildWidget(scope, element, attrs);
			},
			template: widgetAccordion.template
		};
	}
    
}(window, document));