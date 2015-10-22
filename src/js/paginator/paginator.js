/*globals angular */

(function (window, document, undefined) {
    "use strict";

    angular.module('angularWidgets').factory('widgetPaginator',  ['widgetBase', 'wgPaginatorTemplate', function (widgetBase, puiPaginatorTemplate) {
        
    	var widget = {};

        widget.buildWidget = function (scope, element, options) {           
        	return new widget.Paginator(scope, element, options);
        };
	
		widget.Paginator = widgetBase.createWidget({

			init: function(options) {
				
				var template = options.template || '{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink}';
        		
        		this.page = 0;
        		this.rows = parseInt(options.rows) || 10;
        		this.rowCount = 0;
        		this.templateKeys = template.split(/[ ]+/);
        		this.templateElements = [];
        		this.pageLinks = options.pageLinks || 10;
				this.dataLoader = options.dataLoader;

        		if (!this.element) {
        			this.element = angular.element('<div class="pui-paginator ui-widget-header"></div>');
        		}
        		
        		if (options.onChangePageListener) {
        			this.onChangePageListener = options.onChangePageListener;
        		}  

        		if (options.onChangePage) {
        			this.onChangePage = options.onChangePage;
        		}                   		
			},

			getRowCount: function() {
				return this.dataLoader.getRowCount();
			},

			getPageLinks: function() {
        		return this.pageLinks;
        	},
        	
        	getPageCount: function() {
        		return Math.ceil(this.getRowCount() / this.getRows()) || 1;
        	},
        	
        	getFirst: function() {
    			return (this.getCurrentPage() * this.getRows());
    		},
        	
    		getRows: function() {
    			return this.rows;
    		},
    		
        	getCurrentPage: function() {
        		return this.page;
        	},
        	
        	goToPage: function(page) {
        		
        		page = parseInt(page, 10);
        		
        		if ((page > this.getPageCount() - 1) 
        				|| (page === this.page) ) {
        			return;
        		}
        		        		
        		this.page = page;

                if (this.onChangePageListener) {
                	this.onChangePageListener(page);
                }

                if (this.onChangePage) {
                	this.onChangePage(page);
                }
        	},

        	goToPreviousPage: function() {
        		this.goToPage(this.getCurrentPage() -1);
        	},
        	
        	goToNextPage: function() {
        		this.goToPage(this.getCurrentPage() + 1);
        	},
        	
        	goToLastPage: function() {
        		this.goToPage(this.getPageCount() - 1);
        	},
        	
        	goToFirstPage: function() {
        		this.goToPage(0);
        	},

        	update: function () {

				for (var key in this.templateElements) {
					puiPaginatorTemplate.getTemplate(key).update(this.templateElements[key], this);
				}
			},

        	render: function() {
        	
				this.element.html('');
                        
        		for (var i = 0; i < this.templateKeys.length; i++) {
            
        			var templateKey = this.templateKeys[i],
                    	handler = puiPaginatorTemplate.getTemplate(templateKey);

                	if (handler) {
	                    var templateElement = handler.create(this);
	                    this.templateElements[templateKey] = templateElement;
	                    this.element.append(templateElement);
    	            }
	            }
    	    }
		});

		return widget;
	}]);

    angular.module('angularWidgets').factory('wgPaginatorTemplate', function () {
        
        var elementHandlers = {},

		puiPaginatorTemplate = {};

        puiPaginatorTemplate.addTemplate = function (name, handler) {
            elementHandlers[name] = handler;
        };

        puiPaginatorTemplate.getTemplate = function(key) {
            return elementHandlers[key];
        };

        return puiPaginatorTemplate;
    });

    angular.module('angularWidgets').run(['wgPaginatorTemplate', 'widgetBase', function (puiPaginatorTemplate, widgetBase) {

        puiPaginatorTemplate.addTemplate('{FirstPageLink}', {
        	
        	markup: '<span class="pui-paginator-first pui-paginator-element ui-state-default ui-corner-all"><span class="fa fa-step-backward"></span></span>',

        	create: function (paginator) {

            	var element = angular.element(this.markup);

                if (paginator.getCurrentPage() === 0) {
                    element.addClass('ui-state-disabled');
                }
                
                widgetBase.hoverAndFocus(element);                

                element.clickWhenActive(function(e) {
                	paginator.goToFirstPage();
                });

                return element;
            },

            update: function (element, paginator) {
                if (paginator.getCurrentPage() === 0) {
                    element.addClass('ui-state-disabled').removeClass('ui-state-hover ui-state-active');
                }
                else {
                    element.removeClass('ui-state-disabled');
                }
            }
        });

        puiPaginatorTemplate.addTemplate('{PreviousPageLink}', {
                
        	markup: '<span class="pui-paginator-prev pui-paginator-element ui-state-default ui-corner-all"><span class="fa fa-backward"></span></span>',

        	create: function (paginator) {
                    
        		var element = angular.element(this.markup);

                if (paginator.getCurrentPage() === 0) {
                    element.addClass('ui-state-disabled');
                }

                widgetBase.hoverAndFocus(element);

                element.clickWhenActive(function(e) {
                    paginator.goToPreviousPage();
                });

                return element;
            },

            update: function (element, paginator) {
                if (paginator.getCurrentPage() === 0) {
                    element.addClass('ui-state-disabled').removeClass('ui-state-hover ui-state-active');
                }
                else {
                    element.removeClass('ui-state-disabled');
                }
            }
        });

        puiPaginatorTemplate.addTemplate('{NextPageLink}', {
                
        	markup: '<span class="pui-paginator-next pui-paginator-element ui-state-default ui-corner-all"><span class="fa fa-forward"></span></span>',

        	create: function (paginator) {
            
        		var element = angular.element(this.markup);

                if (paginator.getCurrentPage() === (paginator.getPageCount() - 1)) {
                    element.addClass('ui-state-disabled').removeClass('ui-state-hover ui-state-active');
                }

                widgetBase.hoverAndFocus(element);

                element.clickWhenActive(function(e) {
                	paginator.goToNextPage();
                });

                return element;
            },

            update: function (element, paginator) {
            
            	if (paginator.getCurrentPage() === (paginator.getPageCount() - 1)) {
            		element.addClass('ui-state-disabled').removeClass('ui-state-hover ui-state-active');
            	}
            	else {
            		element.removeClass('ui-state-disabled');
            	}
            }
        });

        puiPaginatorTemplate.addTemplate('{LastPageLink}', {
        	
        	markup: '<span class="pui-paginator-last pui-paginator-element ui-state-default ui-corner-all"><span class="fa fa-step-forward"></span></span>',

        	create: function (paginator) {
        		
                var element = angular.element(this.markup);

                if (paginator.getCurrentPage() === (paginator.getPageCount() - 1)) {
                    element.addClass('ui-state-disabled').removeClass('ui-state-hover ui-state-active');
                }

                widgetBase.hoverAndFocus(element);

                element.clickWhenActive(function(e) {
                	paginator.goToLastPage();
                });

                return element;
        	},

        	update: function (element, paginator) {
	            if (paginator.getCurrentPage() === (paginator.getPageCount() - 1)) {
	                element.addClass('ui-state-disabled').removeClass('ui-state-hover ui-state-active');
	            }
	            else {
	                element.removeClass('ui-state-disabled');
	            }
        	}
        });

        puiPaginatorTemplate.addTemplate('{PageLinks}', {
        	
        	markup: '<span class="pui-paginator-pages"></span>',

        	create: function (paginator) {
	            
        		var element = angular.element(this.markup),
	                boundaries = this.calculateBoundaries({
	                    page: paginator.getCurrentPage(),
	                    pageLinks: paginator.getPageLinks(),
	                    pageCount: paginator.getPageCount()
	                }),
	                start = boundaries[0],
	                end = boundaries[1];
	
	            for (var i = start; i <= end; i++) {
	                var pageLinkNumber = (i + 1),
	                    pageLinkElement = angular.element('<span class="pui-paginator-page pui-paginator-element ui-state-default ui-corner-all">' + pageLinkNumber + "</span>");
	
	                if (i === paginator.getCurrentPage()) {
	                    pageLinkElement.addClass('ui-state-active');
	                }
	
	                element.append(pageLinkElement);
	            }
	
	            var pageLinks = angular.element(element.children());
	
	            widgetBase.hoverAndFocus(pageLinks);
	            pageLinks.click(function (e) {
	                var link = angular.element(e.target);
	                if (!link.hasClass('ui-state-disabled') && !link.hasClass('ui-state-active')) {
	                    link.removeClass('ui-state-hover');
	                    paginator.goToPage(parseInt(link.text(), 10) - 1);
	                }
	
	            });
	
	            return element;
        	},
        	
        	update: function (element, paginator) {
                	
                var pageLinks = element.children(),
                	boundaries = this.calculateBoundaries({
                		page: paginator.page,
                		pageLinks: paginator.pageLinks,
                		pageCount: paginator.getPageCount()
                	}),	
                	start = boundaries[0],
                	end = boundaries[1];
                
                pageLinks.removeClass('ui-state-active').removeClass('ui-state-disabled');
                
                for(var i = 0; i <= pageLinks.length - 1; i++) {
                	
                	var pageLinkNumber = (i + 1 + start),
                		pageLink = pageLinks.eq(i);

                	if (i <= end) {                    	
                    
                        if((pageLinkNumber -1) === paginator.getCurrentPage()) {
                        	pageLink.addClass('ui-state-active');
                        }
                        
                        pageLink.text(pageLinkNumber);
                	}
                	else {
                		pageLink.addClass('ui-state-disabled');
                	}
                }
            },

            calculateBoundaries: function (config) {
                
            	var page = config.page,
                    pageLinks = config.pageLinks,
                    pageCount = config.pageCount,
                    visiblePages = Math.min(pageLinks, pageCount);

                //calculate range, keep current in middle if necessary
                var start = Math.max(0, parseInt(Math.ceil(page - ((visiblePages) / 2)), 10)), // Changed for AngularWidgets
                    end = Math.min(pageCount - 1, start + visiblePages - 1);

                //check when approaching to last page
                var delta = pageLinks - (end - start + 1);
                start = Math.max(0, start - delta);

                return [start, end];
            }
        });
    }]);

}(window, document));
