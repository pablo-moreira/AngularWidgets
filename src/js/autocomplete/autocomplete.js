
/*globals angular AngularWidgets*/

(function(window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetAutocomplete', ['$compile', '$timeout', '$parse', '$document', '$http', 'widgetBase', 'widgetInputText', 'widgetDatatable', 'widgetColumn', 'widgetPaginator', 'widgetFacet',
                      function ($compile, $timeout, $parse, $document, $http, widgetBase, widgetInputText, widgetDatatable, widgetColumn, widgetPaginator, widgetFacet) {

        var widget = {};
        
        widget.template = 	'<div class="pui-autocomplete ui-widget">' +
        						'<div ng-transclude></div>' +
        						'<input class="pui-inputtext pui-inputtext ui-widget ui-state-default ui-corner-all">' + 
        						'<input class="pui-inputtext-hidden" type="hidden" />' +        						
        					'</div>';
        
        widget.buildWidget = function(scope, element, attrs) {
        	return new widget.Autocomplete(scope, element, attrs);        	
        };
        
    	widget.Autocomplete = widgetBase.createWidget({
        	
        	optionsDefault: {
				caseSensitive	: false, 
				minQueryLength	: 2,
				forceSelection	: true,
				multiple 		: false,
				dropdown 		: false,
				scrollHeight	: 300,
				item 			: 'item',
				itemLabel 		: null,        			
				paginator 		: false,
				rows			: 30,
				panelWidth		: null,
				disabled		: false,
				completeMethod	: null,
				onItemSelect	: null,
				onItemRemove	: null,
				pageLinks		: 1
			},
    		
    		init: function(options) {

    			this.value = null;
    			this.cachedResult = [];
    			this.childrenScope = [];
    			this.firstLoad = true;
				this.mouseDownOnPanelHappened = false;
				this.columns = null;
			
				this.determineOptions(options);
            	
            	if (this.options.completeMethod) {
            		this.setItems(this.scope.$eval(this.options.completeMethod));
            	}
            	else {
            		this.setItems([]);
            	}
            	
                this.inputQuery = this.element.childrenSelector('.pui-inputtext');
                this.inputValue = this.element.childrenSelector('.pui-inputtext-hidden');
                this.panel = angular.element('<div class="pui-autocomplete-panel ui-widget-content ui-corner-all ui-helper-hidden pui-shadow" style="z-index: 1000; height: auto">' +
        							'<div class="pui-autocomplete-panel-content"></div>' +
        						'</div>');
				this.panel.appendTo(angular.element($document[0].body));
                this.panelContent = this.panel.childrenSelector('.pui-autocomplete-panel-content');
                                            
                var $this = this;
                
                this.scope.$watch(this.element.attr('value'), function(value) {
               		$this.setValue(value, false);
    			});
                
                this.determineTransclude();
               
                if(this.options.multiple) {
                	this.multiContainer = angular.element('<ul class="pui-autocomplete-multiple ui-widget pui-inputtext ui-state-default ui-corner-all">' +
                        '<li class="pui-autocomplete-input-token"></li></ul>')
                        .prependTo(this.element);
                    this.inputContainer = this.multiContainer.childrenSelector('.pui-autocomplete-input-token');
                    this.inputContainer.append(this.inputQuery);
                }
                else {
                    if (this.options.dropdown) {
                        this.dropdownBtn = angular.element('<button type="button" class="pui-autocomplete-dropdown pui-button ui-widget ui-state-default ui-corner-right pui-button-icon-only">' +
                            '<span class="pui-icon fa fa-fw fa-caret-down"></span>' +
                            '<span class="pui-button-text">&nbsp;</span></button>');
                        this.inputQuery.after(this.dropdownBtn);
                        this.inputQuery.removeClass('ui-corner-all').addClass('ui-corner-left');
                    }
                }
                            	
            	var $this = this;

				if (this.options.paginator) {
					
					var $this = this;

					this.paginator = widgetPaginator.buildWidget(this.scope, null, {
						rows: this.options.rows,
						dataLoader: this.items,
						pageLinks: this.options.pageLinks,
						onChangePageListener: function(page) {
							$this.refresh();
						}
					});
					
					this.panel.append(this.paginator.element);
				}
                
                this.bindKeyEvents();
                this.bindEvents();
                
	            if (options.disabled) {
	            	this.scope.$watch(options.disabled, function (value) {
	            		$this.enableDisable(value);
					});	            	
	            }
        	},
        	        	
        	determineOptions: function (options) {
        		this.options = widgetBase.determineOptions(this.scope, this.optionsDefault, options, ['onItemSelect', 'onItemRemove'], ['disabled']);
            },
            
            setItems: function (value) {				
				this.items = widgetBase.determineDataLoader(value);    			
            },
            
    		determineTransclude: function () {
    		    
    			var divTransclude  = this.element.children()[0];

				this.columns = widgetColumn.determineColumnsOptions(divTransclude);
				
				this.facets = widgetFacet.determineFacetsOptions(divTransclude);
				   
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

    		getItemId: function(item) {
   				return this.options.itemId ? item[this.options.itemId] : item;
    		},
    		       	
    		onLoadData: function () {

				this.inputQuery[0].focus();

				if (this.firstLoad) {

					this.firstLoad = false;

					if (this.options.paginator) {
						this.paginator.render();
					}
				} 
				else {
					if (this.options.paginator) {
						this.paginator.update(this.items.getRowCount());
					}
				}

				this.renderItems();
 			},
    		
    		bindKeyEvents: function() {
               
    			var $this = this;
    			
            	this.inputQuery.bind('keyup', function(e) {
                    
            		var keyCode = widgetBase.keyCode,
                        key = e.which,
                        shouldSearch = true;
            		
                    if(key === keyCode.UP 
                    	|| key === keyCode.LEFT 
                    	|| (key === keyCode.DOWN && ( $this.panelVisible() || $this.options.dropdown == false ))
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

                        if(value.length >= $this.options.minQueryLength || (key === keyCode.DOWN && $this.options.dropdown !== false)) {
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
                		
                		var items = $this.columns.length ? $this.tableBody.children() : $this.listContainer.children(),
                			keyCode = widgetBase.keyCode,
                         	highlightedItem = AngularWidgets.filter(items, function(item) {
                         		return angular.element(item).hasClass('ui-state-highlight');
                            })[0];

                         switch(e.which) {
                         	case keyCode.UP:
                            case keyCode.LEFT:
                                var prev = angular.element(highlightedItem.previousElementSibling);

                                if (prev.length !== 0) {
                                    angular.element(highlightedItem).removeClass('ui-state-highlight');
                                    prev.addClass('ui-state-highlight');

                                    if ($this.options.scrollHeight) {
										AngularWidgets.scrollInView($this.panelContent[0], prev[0]);
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
                                        AngularWidgets.scrollInView($this.panelContent[0], next[0]);
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

                this.inputQuery.bind("blur", function(e) { 				

					var query = $this.inputQuery.val();

					if ($this.mouseDownOnPanelHappened) {
						$this.mouseDownOnPanelHappened = false;
					}
					else {
					
						if ($this.options.forceSelection) {

							if ($this.options.multiple) {
								$this.inputQuery.val('');
							}
							else {
								if ($this.cachedResults.indexOf(query) === -1) {
									if (query === '') {
										$this.setValue(null);
									}
									else {
										$this.inputQuery.val($this.getItemLabel($this.value));
									}
								}
							}
						}
						else {
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
										$this.updateModel(inputValue);    	            			
									}
								}
							}
						}

						$this.hide();		
					} 					
				});

				widgetBase.hoverAndFocus(this.inputQuery);
            },
     
            bindEvents: function() {
                
            	var $this = this;

            	if (this.options.multiple) {
            		this.multiContainer.bind('click', function(e) {
            			$this.inputQuery[0].focus();
            		});
            	}
            	else if (this.options.dropdown) {
                    
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

                this.panel.bind('mousedown', function(e) {
                	$this.mouseDownOnPanelHappened = true;
                });

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
                return widgetBase.isVisible(this.panel);
            },
            
            search: function (value) {
                                	
            	this.query = this.options.caseSensitive ? value : value.toLowerCase();
				
				if (this.paginator) {
					this.paginator.page = 0;
				}

				this.refresh();
            },

            refresh: function() {
                
                var $this = this;

                this.items.load(this.buildRequest())
                	.success(function(request) {
	                   	$this.onLoadData();
					})
					.error(function(response) {
						/* TODO - Tratar erros */
						alert(response);
					});
            },
            
            renderItems: function() {
                
				this.cachedResults = [];

				if (this.items.getData().length > 0) {

					this.cleanAndDestroyChildrenScope();
					
					if (this.options.forceSelection) {

						var data = this.items.getData();
						
						// Populate cachedResults
						for (var i=0, l=data.length; i<l; i++) {
							this.cachedResults.push(this.getItemLabel(data[i]));
						}
					}
					
					if (this.columns.length) {
						this.renderTable();
					}
					else {
						this.renderList();
					}

					if(!this.panelVisible()) {
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

            cleanAndDestroyChildrenScope: function() {

				for (var i=0,l=this.childrenScope.length; i<l; i++) {
					this.childrenScope[i].$destroy();
				}

				this.childrenScope = [];
            },
            
            renderTable: function() {
				
				if (!this.tableContainer) {
					this.initTable();	
				}
				else {					
					this.tableBody.children().remove();
				}

				var $this = this;
				
				angular.forEach(this.items.getData(), function (item, i) {

					var trScope = $this.scope.$new(false, $this.scope);
					trScope[$this.options.item] = item;

					// Store childscope for destroy 
					$this.childrenScope.push(trScope);

					var tr = angular.element('<table><tbody><tr class="pui-autocomplete-item ui-widget-content"></tr></tbody></table>')
						.findAllSelector('tr')
						.appendTo($this.tableBody)
						.data('$scope', trScope)
						.addClass( (i%2 === 0) ? 'pui-datatable-even' : 'pui-datatable-odd' );

					angular.forEach($this.columns, function (column) {
						
						var td = angular.element('<table><tbody><tr><td/></tr></tbody></table>')
							.findAllSelector('td')
							.appendTo(tr);
                        
                        if (column.contents.length) {
							td.append(column.contents);							
						}
						else {
							td.append(angular.element('<span ng-bind="' + $this.options.item + '.' + column.field + '"></span>'));
						}						
					});

					$compile(tr)(trScope);

					// Bind events
 					tr.bind('mouseenter', function(e) {

 						$this.tableBody.childrenSelector('.ui-state-highlight').removeClass('ui-state-highlight');

 						tr.addClass('ui-state-highlight');
 					});

 					tr.mousedown(function(e) {
 						$this.onSelectItem(item);
 					});
				});                
						
				// Select the first element
				angular.element(this.tableBody.children()[0]).addClass('ui-state-highlight');
        	},

        	initTable: function() {

				this.tableContainer = angular.element('<table class="pui-autocomplete-items pui-autocomplete-table ui-widget-content ui-widget ui-corner-all ui-helper-reset"><thead></thead><tbody></tbody></table>')
					.appendTo(this.panelContent);
					
				this.tableHead = this.tableContainer.findAllSelector("thead");
				this.tableBody = this.tableContainer.findAllSelector("tbody");
				this.renderTableHead();
        	},

			renderTableHead: function() {

				var $this = this;

				angular.forEach(this.columns, function(column) {

					// Elements are created as child of div tag. And if not valid html, it is not created.
					var th = angular.element('<table><thead><th class="ui-state-default"/></thead></table>').findAllSelector('th');
                            
					th.data('sortBy', column.sortBy);
                            
					$this.tableHead.append(th);
                            
					if (column.headerText) {
                      	th.text(column.headerText);
					}
                            
					if (column.sortable) {
						th
						.addClass('pui-sortable-column')
						.append('<span class="pui-sortable-column-icon ui-icon ui-icon-carat-2-n-s"></span>')
						.data('order', 1);
					}
				});
			},
        	
        	renderList: function() {           
				
				if (!this.listContainer) {	
					this.listContainer = angular.element('<ul class="pui-autocomplete-items pui-autocomplete-list ui-widget-content ui-widget ui-corner-all ui-helper-reset"></ul>')
						.appendTo(this.panelContent);
				}
				else {
					this.listContainer.children().remove();					
				}

				var $this = this;
				
				angular.forEach(this.items.getData(), function (item) {

					var li = angular.element('<ul><li class="pui-autocomplete-item pui-autocomplete-list-item ui-corner-all"></li></ul>')
								.childrenSelector('li');

					if ($this.facets.content) {
						$this.facets.content.transclude(function(tcdElement, tcdScope) {

							// Save the child scope for destroy
							$this.childrenScope.push(tcdScope);

							tcdScope[$this.options.item] = item;

							li.append(tcdElement);
						});
					}
					else {
						li.text($this.getItemLabel(item));
					}

					$this.listContainer.append(li);

					// Bind events
					li.bind('mouseenter', function(e) {

						$this.listContainer.childrenSelector('.ui-state-highlight').removeClass('ui-state-highlight');

						li.addClass('ui-state-highlight');
					});

					li.mousedown(function(e) {
						$this.onSelectItem(item);
					});
				});                

				// Select the first element
				var children = angular.element(this.listContainer.children()[0]).addClass('ui-state-highlight');
        	},
        	
            show: function() {
                
                var $this = this;

                $timeout(function() {
                
            		$this.alignPanel();

                	$this.panel.show();
                	$this.panel.removeClass('ui-helper-hidden');
                });
            },
            
            hide: function() {
            	
            	if (this.panel.hide) {
            		this.panel.hide();        	
            	}
            	
                this.panel.css('height', 'auto');
            },
            
            alignPanel: function() {
                                                
            	var panelWidth = null,
                    height = null,
                    width = null;
			
				var container = this.panelContent.childrenSelector('.pui-autocomplete-items')[0];

				if (this.panelVisible()) {
					width = container.offsetWidth;
					height = container.offsetHeight;
					panelWidth = this.panelContent[0].offsetWidth; // When open keep the same size
				}
				else {
					this.panel.css({'visibility':'hidden','display':'block'});

					width = container.offsetWidth;                       
					height = container.offsetHeight;
					panelWidth = this.panel[0].offsetWidth;

					this.panel.css({'visibility':'visible','display':'none'});
				}

				if (this.options.multiple) {
					
					var inputWidth = this.inputQuery[0].offsetWidth;

					if (width < inputWidth) {
						width = inputWidth;
					}

					if (width < panelWidth) {
						width = panelWidth;
					}
				}
				else {
					var elementWidth = this.element[0].offsetWidth;

					if (width < elementWidth) {
						width = elementWidth;
					}
				}
                      
                //adjust height
                if(this.options.scrollHeight) {
                    if(height >= this.options.scrollHeight) {
                        this.panelContent[0].style.height = this.options.scrollHeight + 'px';
                    }
                    else {
                        this.panelContent[0].style.height = 'auto';
                    }
                }

                if (this.options.panelWidth) {
                	this.panelContent[0].style.width = this.options.panelWidth + 'px';
                }
                else {
                 	if (this.columns.length) {
    	             	this.panelContent.css({ 'overflowY' : 'scroll' });
	               	}
                 	else {
						this.panelContent[0].style.width = width + 'px';	
                 	}
                }
                
                this.panel.position({
                    my: 'left top',
                    at: 'left bottom',
                    of: this.inputQuery
                });
            },
                        
           	onItemMouseDown: function (elementItem) {
            	
            	var $this = this;
            	            	
            	elementItem.bind('mousedown', function(e) {
					$this.onSelectItem(elementItem.data('item'));
				});
            },

            onSelectItem: function (item) {

				this.hide();

				if(this.options.multiple) { 
					this.inputQuery.val('');
					this.addSelectedItem(item);
				}
				else {
					this.inputQuery.val(this.getItemLabel(item));
					this.setValue(item);
				}

				this.inputQuery[0].focus();
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
            
            buildQueryCriterion: function () {
            	return {
            		field : this.options.itemLabel || '*', 
					operator : widgetBase.filterOperator.START_WITH,
					value : this.query
				};
            },

			getFirst: function() {
				return this.options.paginator ? this.paginator.getFirst() : 0;
			},

            buildRequest: function () {
            	
            	var req = {
    				first: this.getFirst(),
    				sorts: [],
    				query: this.query ? this.buildQueryCriterion() : null,
    				filter: this.query ? {
    					operator : widgetBase.predicateOperator.AND,
    					predicates : [ this.buildQueryCriterion() ]
    				} : null
    			};
            	
            	if (this.paginator) {
					req.pageSize = this.paginator.getRows();
				}
            	
            	return req;
            },

            updateModel: function(value) {
                
            	var parseValue = $parse(this.options.value);                
            	parseValue.assign(this.scope, value);            	
            	
            	this.scope.safeApply();

                if (this.options.onItemSelect) {
                    this.options.onItemSelect(value);
                }
            },
            
            setValue: function (value, updateModel) {
            	
            	/* TODO - Many Owners of TRUE, keep value only in the model  */
				if (value === undefined) {
					value = null;
				}

            	if (this.options.multiple && !angular.isArray(value)) {
            		value = [];
            		updateModel = true;
            	}
				
				if (!this.isSelectedItem(value)) {

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

					if (updateModel !== false) {
						this.updateModel(value);
					}
				}
            },
            
			isSelectedItem: function(item) {
				
				if (this.value === null) {
					return false;
				}

				var items = this.options.multiple ? this.value : [ this.value ];
										
				var itemId = this.getItemId(item);

				for (var i=0,l=items.length; i<l; i++) {

					var	curItemId = this.getItemId(items[i]);

					if (angular.equals(curItemId,itemId)) {
						return true;
					}
				}

				return false;
			},

            addSelectedItem: function (item) {

            	if (!this.isSelectedItem(item)) {
            	
					this.value.push(item);

            		this.renderSelectedItem(item);
            		
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
            		
                    if (this.options.onItemRemove) {
                        this.options.onItemRemove(item);
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