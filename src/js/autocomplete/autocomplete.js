
/*globals angular AngularWidgets*/

(function(window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetAutocomplete', ['$compile', '$timeout', '$parse', '$document', '$http', 'widgetBase', 'widgetInputText', 'widgetDatatable', 'widgetColumn',
                      function ($compile, $timeout, $parse, $document, $http, widgetBase, widgetInputText, widgetDatatable, widgetColumn) {

        var widget = {};
        
        widget.template = '<div class="pui-autocomplete-container"><div ng-transclude></div><input class="pui-inputtext ui-widget ui-state-default"><input type="hidden" /><div class="pui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden pui-shadow" style="z-index: 1000"></div></div>';
        
        widget.buildWidget = function(scope, element, attrs) {
        	return new widget.Autocomplete(scope, element, attrs);        	
        };
        
    	widget.Autocomplete = widgetBase.createWidget({
        	
    		value: null,
    		
    		init: function(options) {
        						
				this.determineOptions(options);
            	
            	if (this.options.completeMethod) {
            		this.determineCompleteMethod(this.scope.$eval(this.options.completeMethod));
            	}
            	
            	var inputElement = this.element.childrenSelector('input'),
                    panelElement = this.element.childrenSelector('.pui-autocomplete-panel');

                this.inputQuery = angular.element(inputElement[0]);
                this.inputValue = angular.element(inputElement[1]);
                
                this.inputData = widgetInputText.buildWidget(this.inputQuery, options, this.options);
                this.panel = angular.element(panelElement[0])
                            
                var $this = this;
                
                this.scope.$watch(this.options.value, function(value) {
               		$this.updateValue(value);
    			});
                
                this.determineTransclude();
                
                $compile(this.element.contents())(this.scope);
               
                if(this.options.multiple) {
                	this.multiContainer = angular.element('<ul class="pui-autocomplete-multiple ui-widget pui-inputtext ui-state-default ui-corner-all">' +
                        '<li class="pui-autocomplete-input-token"></li></ul>')
                        .prependTo(this.element);
                    this.inputContainer = this.multiContainer.childrenSelector('.pui-autocomplete-input-token');
                    this.inputContainer.append(this.inputQuery);
                }
                else {
                    if (this.options.dropdown) {
                        this.dropdownBtn = angular.element('<button type="button" class="pui-button ui-widget ui-state-default ui-corner-right pui-button-icon-only">' +
                            '<span class="pui-autocomplete-dropdown pui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="pui-autocomplete-dropdown pui-button-text">&nbsp;</span></button>');
                        this.element.after(this.dropdownBtn);
                        this.element.removeClass('ui-corner-all').addClass('ui-corner-left');
                    }
                }
                            	
            	var $this = this;
            	
            	if (this.completeMethod) {
            	
	            	var superLoad = this.completeMethod.load;
	                
	            	var firstLoad = true;
	            	
	            	this.completeMethod.load = function (request) {
	                	
	            		// Avoid first call from datatable load
	            		if (firstLoad && request != null) {
	            			return ;
	            		}
	
	            		if (request) {
	            			// Request by dataTable interface
	            			if (request.filter && request.filter.predicates) {
	            				request.filter.predicates.push($this.buildQueryCriterion());
	            			}
	            			else {
	            				if ($this.query) {
	            					request.filter = $this.buildRequest().filter 
	            				}
	            			}
	            		}
	            		else {
	            			// Request by inputQuery interface
	            			request = $this.buildRequest();
	            		}
	
	            		superLoad.call(this, request);
	            		
	            		$this.onLoadData();
	            		
	            		if (firstLoad) {
	            			firstLoad = false;
	            			$this.scope.$apply();
	            		}
	            	};
            	}
            	            	                
                if (this.columns.length) {
                	
                	var dataTable = widgetDatatable.create(this.scope, this.panel, {
            			columns : this.columns,
            			items : this.completeMethod,
            			item : this.options.item,
            			onBuildRow : function (dataTable, scope, element, attrs) { $this.onBuildDataTableRow(dataTable, scope, element, attrs); },
                		paginator : this.options.paginator,
                		rows: this.options.rows
            		});

                	this.dataTable = dataTable;
                	
                	this.dataTable.element.addClass('pui-autocomplete-items');                	
                }
                
                this.bindKeyEvents();
                this.bindEvents();
                this.addBehaviour();
        	},
        	
        	onBuildDataTableRow: function (dataTable, scope, element, attrs) {
        		
        		element = angular.element(element);
        		        		
        		scope.$watch('$index', function (newValue, oldValue) {
					if (newValue == 0) {
						element.addClass('ui-state-highlight');
					}
					else {
						element.removeClass('ui-state-highlight');
					}
				});
        		
                element.bind('mouseenter', function() {
                	
                	angular.forEach(element.parent().children(), function (itemPanel) {
                		angular.element(itemPanel).removeClass('ui-state-highlight');
                	});
                        
                	element.addClass('ui-state-highlight');
                });  
                
                this.bindOnPanelItemMouseDown(element);
        	},
        	
        	determineOptions: function (options) {

        		this.options = {
        			minQueryLength : 2,
        			dropdown : false,
        			scrollHeight: 200,
        			item : 'item',
        			itemLabel : null,        			
        			paginator : false,
        			rows: 10,
        			panelWidth: null,
        			disabled: false,
        			completeMethod: null,
        			itemSelect: null,
        			itemRemove: null
        		}
        		
        		widgetBase.determineOptions(this.scope, this.options, options, ['itemSelect', 'itemRemove']);
            },
            
            determineCompleteMethod: function (cm) {

    			if (angular.isString(cm)) {
    				this.completeMethod = new AngularWidgets.HttpDataLoader({ url: cm });
    			}
    			else if (angular.isFunction(cm)) {
    				this.completeMethod = new AngularWidgets.FunctionDataLoader(cm);
    			}
    			else if ( cm instanceof AngularWidgets.HttpDataLoader ) {
    				this.completeMethod = cm;
    			}
    			else {
    				this.completeMethod = new AngularWidgets.ArrayDataLoader(cm);
    			}
    			
    			var $this = this;
    			
    			this.completeMethod.init({
        			http : $http,
        			onLoadData : function () {
        				$this.onLoadData();
        			}
        		});
            },
            
    		determineTransclude: function () {
    		    
    			var divTransclude  = this.element.children()[0];

    			this.columns = widgetColumn.determineColumnsOptions(divTransclude);
    									
    			// Delete transclude div
    			angular.element(divTransclude).remove();
    		},
    		
    		getItemLabel: function(item) {
    			if (item) {
    				return this.options.itemLabel ? item[this.options.itemLabel] : item;	
    			}
    			else {
    				return "";
    			}
    		},
           
            isHttpDataLoader: function() {
    			return this.completeMethod instanceof AngularWidgets.HttpDataLoader;
    		},
    		       	
    		onLoadData: function () {
    			
                this.inputQuery[0].focus();
                this.inputQuery.triggerHandler("focus");
    			
        		if (!this.isHttpDataLoader()) {
        			this.handleData();
        		}
 			},
    		
    		bindKeyEvents: function() {
                
    			var $this = this;
    			
            	this.inputQuery.bind('keyup', function(e) {
                    
            		var keyCode = widgetBase.keyCode,
                        key = e.which,
                        shouldSearch = true;
            		
                    if(key === keyCode.UP 
                    	|| key === keyCode.LEFT 
                    	|| (key === keyCode.DOWN && $this.panelVisible())
                    	|| key === keyCode.RIGHT 
                    	|| key === keyCode.TAB 
                    	|| key === keyCode.SHIFT 
                    	|| key === keyCode.ENTER 
                    	|| key === keyCode.END
                    	|| key === keyCode.HOME
                    	|| key === keyCode.NUMPAD_ENTER) {
                        shouldSearch = false;
                    }

                    if(shouldSearch) {
                        
                    	var value = $this.inputQuery.val();

                        if(!value.length && key !== keyCode.DOWN) {
                        	$this.hide();
                        }

                        if(value.length >= $this.options.minQueryLength || key === keyCode.DOWN) {
                            if($this.timeout) {
                            	$timeout.cancel($this.timeout);
                            }

                            $this.timeout = $timeout(function() {
                            	$this.search(value);
                            }, $this.options.delay);
                        }
                    }
                });

                this.inputQuery.bind('keydown', function(e) {
                	
                	if ($this.panelVisible()) {
                		
                		var items = $this.columns.length ? $this.dataTable.tbody.children() : $this.listContainer.children(),
                			keyCode = widgetBase.keyCode,
                         	highlightedItem = AngularWidgets.filter(items, function(item) {
                         		return angular.element(item).hasClass('ui-state-highlight');
                            })[0];

                         switch(e.which) {
                         	case keyCode.UP:
                            case keyCode.LEFT:
                                var prev = angular.element(highlightedItem.previousElementSibling);

                                if(prev.length !== 0) {
                                    angular.element(highlightedItem).removeClass('ui-state-highlight');
                                    prev.addClass('ui-state-highlight');

                                    if($this.options.scrollHeight) {
                                        AngularWidgets.scrollInView($this.panel[0], prev[0]);
                                    }
                                }

                                e.preventDefault();
                                break;

                            case keyCode.DOWN:
                            case keyCode.RIGHT:
                                
                            	var next = angular.element(highlightedItem.nextElementSibling);

                                if(next.length !== 0) {
                                    angular.element(highlightedItem).removeClass('ui-state-highlight');
                                    next.addClass('ui-state-highlight');

                                    if($this.options.scrollHeight) {
                                        AngularWidgets.scrollInView($this.panel[0], next[0]);
                                    }
                                }

                                e.preventDefault();
                                break;

                            case keyCode.ENTER:
                            case keyCode.NUMPAD_ENTER:
                                angular.element(highlightedItem).triggerHandler('mousedown');
                                e.preventDefault();
                                break;

                            case keyCode.ALT:
                            case 224:
                                break;

                            case keyCode.TAB:
                                angular.element(highlightedItem).triggerHandler('mousedown');
                                //e.preventDefault();
                                break;
                        }
                    }
                });
            },

            bindEvents: function() {
                
            	var $this = this;
            	
            	if (this.options.dropdown) {
                    
            		widgetBase.hoverAndFocus(this.dropdownBtn);
            		
    	        	widgetBase.mouseDownAndUp(this.dropdownBtn, function(e) {
    	        		$this.search('');
    	        	});
    	        	
    	        	widgetBase.onKeydownEnterOrSpace(this.dropdownBtn, function(e) {
    	        		$this.search('');
    	        	})
    	        	
    	        	this.dropdownBtn.bind('keyup', function(e){ 
    	        		$this.dropdownBtn.removeClass('ui-state-active');	        		
    	        	});
                }
            	
            	if (this.options.multiple) {
            		this.multiContainer.bind('click', function(e) {
            			$this.inputQuery[0].focus();
            		});
            	}

                $document.bind("click", function (event) {
                	
                	if ($this.panelVisible()) {
                		
                		var clickOnInputQuery = event.target == $this.inputQuery[0];
                		var clickOnDropdown = angular.element(event.target).hasClass('pui-autocomplete-dropdown');                			
                		
                		if (!(clickOnInputQuery || clickOnDropdown)) {

                			// TODO - Improve this code
                			var clickOnPanel = $this.isRelative(event.target, $this.panel[0]);
                			
                			if (!clickOnPanel) {                			
                				$this.panel.hide();
                				$this.inputQuery.triggerHandler("blur");
                			}
                		}
                	}
                });
            },
            
            isRelative: function (element, parent) {
            	
            	var elemParent = angular.element(element).parent()[0];
            	
            	if (elemParent == undefined) {
            		return false;
            	}
            	else if (elemParent == parent) {
            		return true;
            	}
            	else {
            		return this.isRelative(elemParent, parent);
            	}            	
            },
            
            unbindEvents: function() {

                if (this.options.dropdown) {

                	widgetBase.resetHoverAndFocus(this.dropdownBtn);

                    this.dropdownBtn.unbind('mouseup');
                }
            },
            
            panelVisible: function() {
                return this.panel.css('display') !== 'none' && !this.panel.hasClass('ui-helper-hidden');
            },
            
            search: function (value) {
                
            	this.query = value.toLowerCase(); //autoComplete.options.caseSensitive ? value : value.toLowerCase(),

                this.completeMethod.load(null);
            },
            
            handleData: function() {
                
                if (this.columns.length) {
                	this.renderTable();
                }
                else {
                	
                	this.panel.html('');

                	this.renderList();
                }
            },
            
            renderTable: function() {

            	var hidden = !this.panelVisible(),
            		data = this.completeMethod.getData();

            	if (data.length > 0) {
            		if(hidden) {
                        this.show();
                    }
                    else {
                        this.alignPanel();
                    }
            	}
            	else {
            		this.hide();
            	}
        	},
        	
        	renderList: function() {
	            
            	var items = [],
                    hidden = !this.panelVisible(),
                    data = this.completeMethod.getData();
            	            	
        		this.listContainer = angular.element('<ul class="pui-autocomplete-items pui-autocomplete-list ui-widget-content ui-widget ui-corner-all ui-helper-reset"></ul>');
                this.panel.append(this.listContainer);

                for(var i = 0; i < data.length; i++) {
                	
                	var li = angular.element('<ul><li class="pui-autocomplete-item pui-autocomplete-list-item ui-corner-all"></li></ul>')
                				.childrenSelector('li');

                    li.data('item', data[i]);

                    /* TODO - ?? */
                    if(this.options.content) {
                        li.html(this.options.content.call(this, data[i]));
                    }
                    else {
                    	if (this.options.itemLabel) {
                    		li.text(data[i][this.options.itemLabel]);
                    	}
                    	else {
                    		li.text(data[i])
                    	}
                    }

                    this.listContainer.append(li);
                    
                    items.push(li);
                }

                this.bindDynamicEvents(items);

                if(items.length > 0) {
                	
                    items[0].addClass('ui-state-highlight');

                    // TODO - Check this.alignPanel same code
                    // adjust height
//                    if(this.options.scrollHeight) {
//
//                    	var heightConstraint = hidden ? this.panel.height() : this.panel.children().height();
//
//                        if (heightConstraint > this.options.scrollHeight) {
//                            this.panel.height(this.options.scrollHeight);
//                        }
//                        else {
//                            this.panel.css('height', 'auto');
//                        }
//                    }

                    if(hidden) {
                        this.show();
                    }
                    else {
                        this.alignPanel();
                    }
                }
                else {
                    this.panel.hide();
                }
        	},
        	
            show: function() {
                
            	this.alignPanel();

                this.panel.show();
                this.panel.removeClass('ui-helper-hidden');
            },
            
            hide: function() {
            	
            	if (this.panel.hide) {
            		this.panel.hide();        	
            	}
            	
                this.panel.css('height', 'auto');
            },
            
            alignPanel: function() {
                
            	var panelWidth = null,
                    heightConstraint = null,
                    panelVisible = this.panelVisible();

                if (this.options.multiple) {
                    panelWidth = this.inputQuery[0].offsetWidth;
                    heightConstraint = this.panel.children()[0].offsetHeight;
                } 
                else {
                   
                	if(panelVisible) {
                        panelWidth = this.panel.childrenSelector('.pui-autocomplete-items').offsetWidth;
                        heightConstraint =this.panel.children().height();
                    }
                    else {
                        this.panel.css({'visibility':'hidden','display':'block'});
                        panelWidth = this.panel.childrenSelector('.pui-autocomplete-items')[0].offsetWidth;
                        heightConstraint = this.panel[0].offsetHeight;
                        this.panel.css({'visibility':'visible','display':'none'});
                    }

                    var inputWidth = this.inputQuery[0].offsetWidth;
                    
                    if(panelWidth < inputWidth) {
                        panelWidth = inputWidth;
                    }
                }
                
                if (this.options.panelWidth) {
                	panelWidth = this.options.panelWidth;
                }
      
                //adjust height
                if(this.options.scrollHeight) {
                    if(heightConstraint > this.options.scrollHeight) {
                        this.panel[0].style.height = this.options.scrollHeight + 'px';
                    }
                    else {
                        this.panel[0].style.height = 'auto';
                    }
                }

                this.panel[0].style.width = panelWidth + 'px';
                this.panel.position({
                    my: 'left top',
                    at: 'left bottom',
                    of: this.inputQuery
                });
            },
            
            highlightInList: function(items) {
                
            	var $items = items;
                
            	angular.forEach(items, function (item) {

                    angular.element(item).bind('mouseenter', function() {

                        angular.forEach($items, function (itemPanel) {
                            angular.element(itemPanel).removeClass('ui-state-highlight');
                        });
                        
                        item.addClass('ui-state-highlight');
                    });

                });
            },
            
            bindOnPanelItemMouseDown: function (panelItem) {
            	
            	var $this = this;
            	
            	var item = panelItem.data('item');
            	
            	panelItem.bind('mousedown', function(e) {
            		
                	if($this.options.multiple) { 
                		$this.addSelectedItem(item);
                        $this.inputQuery.val('');
                        $this.hide();
                    }
                	else {
                		$this.setValue(item);
                	}

                    $this.inputQuery[0].focus();
                });
            },
            
            bindDynamicEvents: function(panelItens) {
                
            	var cachedResults = [];
                
                this.highlightInList(panelItens);

                var $this = this;
                
                angular.forEach(panelItens, function(panelItem) {
                    
                	var item = panelItem.data('item');
                	var itemLabel = $this.getItemLabel(item);
                	  
                	$this.bindOnPanelItemMouseDown(panelItem);                    
                    
                    if ($this.options.forceSelection) {
                        cachedResults.push(itemLabel);
                    }
                });

                if (this.options.forceSelection) {
                    
                	this.inputQuery.bind("blur", function (e) {
                        
                    	var idx = cachedResults.indexOf($this.inputQuery.val());
                        
                        if (idx === -1) {
                            $this.inputQuery.val("");
                            $this.updateModel("");
                        }
                        
                        $this.hide();
                    });
                }
                else {
                	
                	this.inputQuery.bind("blur", function (e) {
                		
                		if ($this.options.multiple) {
                			$this.inputQuery.val('');
                		}
                		else {	
                            
                    		var inputValue = $this.inputQuery.val();
                    		var value = $this.value;                    		
                    		var itemLabel = $this.getItemLabel(value);
                    		
                    		if (itemLabel != inputValue) {
                    			
                    			if ($this.options.itemLabel) {
        	            			var obj = {};
        	            			obj[$this.options.itemLabel] = inputValue;            			
        	            			$this.updateModel(obj);
        	            		}
        	            		else {
        	            			$this.updateModel(value);    	            			
        	            		}
                    		}
                		}                		
            			
            			$this.hide();
                    });
                }
            },
                       
            enableDisable: function (value) {
            	
            	widgetInputText.enableDisableStatic(this.inputQuery, value);
            	
            	if (value === true) {	

            		this.unbindEvents();
                
                    if(this.options.dropdown) {
                        this.dropdownBtn.addClass('ui-state-disabled');
                    }                    
                }
                else {
                	this.bindEvents();

                    if(this.options.dropdown) {
                        this.dropdownBtn.removeClass('ui-state-disabled');
                    }
                }
            },

            addBehaviour: function() {
                
            	widgetBase.hoverAndFocus(this.inputQuery);

                if (this.options.disabled !== undefined) {
                	var $this = this;         	
                	this.scope.$watch(this.options.disabled, function(value) {
                		$this.enableDisable(value);
                	});
                }
            },
            
            buildQueryCriterion: function () {
            	return {
            		field : this.options.itemLabel || '*', 
					operator : widgetBase.filterOperator.START_WITH,
					value : this.query
				};
            },

            buildRequest: function () {
            	
            	var req = {
    				first: 0,
    				sorts: this.dataTable ? this.dataTable.sorts : [],
    				query: this.query ? this.buildQueryCriterion() : null,
    				filter: this.query ? {
    					operator : widgetBase.predicateOperator.AND,
    					predicates : [ this.buildQueryCriterion() ]
    				} : null
    			};
            	
            	if (this.dataTable && this.dataTable.options.paginator) {
   					req.pageSize = this.dataTable.paginatorData.rows;
            	}
            	
            	return req;
            },
            
            updateValue: function (value) {
            	
            	if (this.value !== value) {
            		
            		this.value = value;
            	
            		if(this.options.multiple) {
	            		
            			var $this = this;
            			
	                	this.multiContainer.childrenSelector('.pui-autocomplete-token').remove();
	                	                	
	                	angular.forEach(value, function (item) {        	
	                		$this.renderSelectedItem(item);
	                	});
	            		
	                	this.inputQuery.val('');
	            	}
	            	else {
	            		this.inputQuery.val(this.getItemLabel(value));	
	            	}
            	}
            },
            
            updateModel: function(value) {
                
            	var parseValue = $parse(this.options.value);                
            	parseValue.assign(this.scope, value);            	
            	
            	this.scope.safeApply();

                if (this.options.addSelection) {
                    this.options.addSelection(value);
                }

                if (this.options.makeSelection) {
                    this.options.makeSelection(value);
                }
            },
            
            setValue: function (value) {
            	this.updateModel(value);            	
            },
            
            addSelectedItem: function (item) {

            	if (this.value.indexOf(item) === -1) {
            	
            		this.renderSelectedItem(item);
            		
                	this.value.push(item);
	                	
                	this.scope.safeApply();
	                	
                    if (this.options.itemSelect) {
                    	this.options.itemSelect(item);
                    }
            	}
            },
            
            renderSelectedItem: function(item) {
            	
            	var tokenMarkup = '<ul><li class="pui-autocomplete-token ui-state-active ui-corner-all">';
                tokenMarkup += '<span class="pui-autocomplete-token-icon ui-icon ui-icon-close"></span>';
                tokenMarkup += '<span class="pui-autocomplete-token-label">' + this.getItemLabel(item) + '</span></li></ul>';
        	
                var itemElement = angular.element(tokenMarkup).childrenSelector('.pui-autocomplete-token');
                this.multiContainer.append(itemElement);
                this.multiContainer.append(this.inputContainer);

            	var $this = this;
                
                angular.element(itemElement).childrenSelector('.pui-autocomplete-token-icon').bind('click', function() {
                	$this.removeSelectedItem(item);
                });
            },
            
            removeSelectedItem: function(item) {
            	
            	var itemsElement = this.multiContainer.childrenSelector('.pui-autocomplete-token');
            	
            	var index = this.value.indexOf(item);       	
            	
            	if (index !== -1) {
            		
            		var itemElement = itemsElement[index];
            		
            		itemElement.remove();
                 	
            		this.value.splice(index, 1);
            		
            		this.scope.safeApply();
            		
                    if (this.options.itemRemove) {
                        this.options.itemRemove(item);
                    }            		
            	}
            }
        });
                
        return widget;
    }]);
    
    angular.module('pje.ui').directive('puiAutocomplete', ['widgetAutocomplete', function (widgetAutocomplete) {
        return {
            restrict: 'E',
            replace: true,            
			transclude: true,
            template: widgetAutocomplete.template,
            link: function (scope, element, attrs) {
            	widgetAutocomplete.buildWidget(scope, element, attrs);
            }
        };
    }]);

}(window, document));
