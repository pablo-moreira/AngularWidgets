(function(window, document, undefined) {
	"use strict";
	
	angular.module('angularWidgets')			
		.factory('widgetDatalist', ['$compile', '$http', 'widgetBase', 'widgetPaginator', 'widgetFacet', '$wgMessages', DatalistWidget])
		.directive('wgDatalist', ['widgetDatalist', DatalistDirective]);

	function DatalistWidget($compile, $http, widgetBase, widgetPaginator, widgetFacet, $wgMessages) {
			
		AngularWidgets.configureWidget('datalist', {
			emptyMessage: 'No items found.',
			item: 'item',
			itemId: undefined,
			itemLabel: undefined,
			type: 'none', // 'unordered', // 'definition', 'ordered'
			itemType: undefined, // 'disc'
			items: [],
			selectionMode: undefined,
			onItemSelect: undefined,
			onItemUnselect: undefined,
			rows: 10,
			paginator: false,
			itemStyleClass: undefined,
			loadOnRender: true,
			loadOnDemand: false,
			responsive: false, // reflow, TODO flip-scroll
			onError: function(datatable, context, event) {

				if ($wgMessages.isVisible()) {
					$wgMessages.addErrorMessage('Datalist error', context.error);
				}
				else {
					$wgMessages.showErrorMessage('Datalist error', context.error);
				}

				AngularWidgets.$log.error(context);
			}
		});

		var widget = {};

		widget.template = 	'<div class="pui-datalist ui-widget">' + 
								'<div ng-transclude></div>' + 
								'<div class="pui-datalist-content ui-widget-content"></div>' +
							'</div>';

		widget.buildWidget = function(scope, element, attrs) {
			return new widget.Datalist(scope, element, attrs);
		};

		widget.create = function(scope, container, options) {

			var element = angular.element(this.template);

			container.append(element);

			return new widget.Datalist(scope, element, options);
		};

		widget.Datalist = widgetBase.createWidget({

			init: function(options) {
				
				var $this = this;

				this.childrenScope = [];
				this.selection = [];
				this.firstLoad = true;
				this.sorts = [];
				
				this.determineOptions(options);

				this.content = this.element.childrenSelector('.pui-datalist-content');

				this.setItems(this.options.itemsBind ? this.scope.$eval(this.options.items) : this.options.items);

				if (this.options.restriction) {
					this.restriction = this.scope.$eval(this.options.restriction);                		
				}

				if (this.options.paginator) {

					this.paginator = widgetPaginator.buildWidget(this.scope, null, {
						rows: this.options.rows,
						dataLoader: this.items,
						onChangePageListener: function(page) {
							$this.refresh();                   
						}
					});
					
					this.paginator.element.addClass('pui-paginator-bottom');
					this.element.append(this.paginator.element);

					this.dataModel = new AngularWidgets.PaginatedDataModel({						
						rows: this.options.rows,
						dataSource: this.items,
						paginator: this.paginator
					});
				}
				else if (this.options.loadOnDemand) {

					this.onDemandDataModel = new AngularWidgets.OnDemandDataModel({					
						rows: this.options.rows,
						dataSource: this.items,
						onChangePageListener: function(page) {
							$this.refresh();
						}
					});

					this.dataModel = this.onDemandDataModel;
				}
				else {
					this.dataModel = new AngularWidgets.BasicDataModel({
						dataSource: this.items
					});
				}

				this.determineTransclude();

				this.buildFacets();

				if (this.element.children().length === 1) {
					this.content.addClass('pui-datalist-alone');
				}

				this.renderListContainer();			

				widgetBase.createBindAndAssignIfNecessary(this, "getCurrentPage,goToPage,refresh");

				if (this.options.loadOnRender) {
					this.refresh();
				}
			},		

			setItems: function(value) {
				this.items = widgetBase.determineDataSource(value);
			},

			determineOptions: function(options) {					
				this.options = widgetBase.determineOptions(this.scope, AngularWidgets.getConfiguration().widgets.datalist, options, ['onItemSelect', 'onItemUnselect']);
				this.options.itemsBind = angular.isString(options.items);
			},

			determineTransclude: function() {

				var divTransclude = angular.element(this.element.children()[0]);

				this.facets = widgetFacet.determineFacetsOptions(divTransclude);

				if (this.facets.content) {
					this.facets.content.transcluded = angular.element('<div></div>').append(this.facets.content.transclude()).html();
				}

				divTransclude.remove();
			},

			refresh: function() {

				var $this = this;

				this.dataModel.load(this.createRequest(),
					function() {
						$this.onLoadData();
					},
					function(response) {
						$this.options.onError($this.bindInstance, response, 'load');
					}
				);
			},

			onLoadData: function() {

				if (this.firstLoad) {

					this.firstLoad = false;			

					if (this.options.paginator) {
						this.paginator.render();
					}
				} 
				else {
					if (this.options.paginator) {
						this.paginator.update();
					}
				}

				this.renderListContent();

				if (this.options.loadOnDemand && this.onDemandLoader === undefined) {
					
					this.onDemandLoader = angular.element('<div class="pui-datalist-loader"></div>');

					this.content.append(this.onDemandLoader);

					var watcher = scrollMonitor.create(this.onDemandLoader);

					var $this = this;
					
					watcher.enterViewport(function() {
						if ($this.dataModel.hasMoreRows()) {
							var li = $this.createListItem().addClass('pui-datalist-loader').append('<i class="fa fa-2x fa-spinner fa-pulse"></i>');
							$this.listContainer.append(li);
							$this.onDemandDataModel.nextPage();
						}
					});
				}
			},

			renderListContainer: function() {
				
				if (this.options.type === 'ordered') {
					this.listTag = 'ol';
					this.itemTag = 'li';
				}
				else if (this.options.type === 'definition') {
					this.listTag = 'dl';
					this.itemTag = 'dt';
				}
				else {
					this.listTag = 'ul';
					this.itemTag = 'li';
				}
				
				this.listContainer = angular.element('<' + this.listTag + ' class="pui-datalist-data"></' + this.listTag + '>').appendTo(this.content);

				if (this.options.type === 'none') {
					this.listContainer.addClass('pui-datalist-nobullets');
				}
			},

			createListItem: function() {
				return angular.element('<' + this.listTag + '><' + this.itemTag + '></' + this.itemTag + '></' + this.listTag + '>').childrenSelector(this.itemTag);
			},

			removeListItem: function(listItem) {
				var scope = listItem.data('itemScope');				
				if (scope) scope.$destroy();
				listItem.remove();
			},

			removeListItems: function(listItems) {				
				for (var i=0,t=listItems.length; i<t; i++) {
					this.removeListItem(angular.element(listItems[i]));
				}				
			},

			renderListContent: function() {

                var $this = this;

				var children = Array.prototype.slice.call(this.listContainer.children());

				if ($this.dataModel.getData().length > 0) {

					angular.forEach($this.dataModel.getData(), function (item, index) {

						var oldLi;

						if (children.length > 0) {							
							oldLi = angular.element(children[0]);
						}

						var itemKey = $this.options.item ? $this.options.item : 'item',
							itemScope = $this.scope.$new(false, $this.scope);
						
						itemScope[itemKey] = item;
						
						var li = $this.createListItem()
								.addClass('pui-datalist-item')
								.addClass(index % 2 === 0 ? 'pui-even' : 'pui-odd');
												
						// Store childscope for destroy
						li.data('itemScope', itemScope);
						
						if ($this.options.itemStyleClass !== undefined) {
							li.addClass($this.options.itemStyleClass);
						}

						// Determine content
						if ($this.facets.content) {
							li.append($this.facets.content.transcluded);
						}	
						else if ($this.options.itemLabel) {
							li.append(item[$this.options.itemLabel]);
						}
						else {
							if (AngularWidgets.isObject(item)) {
								li.append('{{' + itemKey + '| json }}');
							}
							else {
								li.append('{{' + itemKey + '}}');
							}
						}
						
						// Selection
						if ($this.options.selectionMode) {							
							$this.initSelection(li, item);
						}

						$compile(li)(itemScope);
						
						if (oldLi) {							
							oldLi.after(li);							
							$this.removeListItem(oldLi);
							children.shift();
						}
						else {
							$this.listContainer.append(li);	
						}	
					});	
					
					$this.removeListItems(children);
				}
				else {
					$this.removeListItems(children);															
					
					var liEmpty = $this.createListItem()
						.addClass('pui-datalist-empty-message')
						.append($this.options.emptyMessage);
				
					$this.listContainer.append(liEmpty);
				}
            },

			createRequest: function() {

				var request = {
					first: this.dataModel.getFirst(),
					sorts: this.sorts
				};

				if (this.restriction) {

					request.restriction = this.restriction.createRequest();

					if (!AngularWidgets.equals(this.lastRestriction, request.restriction)) {
						request.first = 0;
						this.dataModel.onChangeRestriction();
					}				

					this.lastRestriction = request.restriction;
				}

				if (this.dataModel.getPageSize) {
					request.pageSize = this.dataModel.getPageSize();
				}

				return request;
			},

			buildFacets: function() {

				if (this.facets) {
					if (this.facets.header) {
						var header = angular.element('<div class="pui-datalist-header ui-widget-header ui-corner-top"></div>')
								.prependTo(this.element)
								.append(this.facets.header.transclude());
					}

					if (this.facets.footer) {
						var footer = angular.element('<div class="pui-datalist-footer ui-widget-header ui-corner-bottom"></div>')
								.appendTo(this.element)
								.append(this.facets.footer.transclude());
					}
				}
			},

			isSelected: function(item) {
				return AngularWidgets.inArray(this.selection, this.options.itemId ? this.getItemId(item) : item);
			},

			initSelection: function(li, item) {
				
				var $this = this;

				li.hover(function() {
					if (!li.hasClass('ui-state-highlight')) {
						li.addClass('ui-state-hover');
					}
				}, function() {
					if (!li.hasClass('ui-state-highlight')) {
						li.removeClass('ui-state-hover');
					}
				});

				li.bind('click', function(e) {

					var selected = li.hasClass('ui-state-highlight'), 
					metaKey = event.metaKey || event.ctrlKey, 
					shiftKey = event.shiftKey;

					// unselect a selected row if metakey is on
					if (selected && metaKey) {
						$this.unselectRow(li, item, false);
					} 
					else {
						//unselect previous selection if this is single selection or multiple one with no keys
						if ($this.isSingleSelection() || ($this.isMultipleSelection() && !metaKey && !shiftKey)) {
							$this.unselectAllRows();
						}

						$this.selectRow(li, item, false);
					}					
				});

				if (this.isSelected(item)) {
					li.addClass("ui-state-highlight");	
				}
			},

			isSingleSelection: function() {
				return this.options.selectionMode === 'single';
			},

			isMultipleSelection: function() {
				return this.options.selectionMode === 'multiple';
			},

			selectRow: function(li, item, silent) {

				li.removeClass('ui-state-hover').addClass('ui-state-highlight').attr('aria-selected', true);

				this.addSelection(item);

				if (!silent && this.options.onItemSelect) {
					this.options.onItemSelect(item);
				}
			},

			unselectRow: function(li, item, silent) {

				li.removeClass('ui-state-highlight').attr('aria-selected', false);

				this.removeSelection(item);

				if (!silent && this.options.onItemUnselect) {
					this.options.onItemUnselect(item);
				}
			},

			unselectAllRows: function(silent) {

				if (this.selection.length > 0) {

					this.listContainer.childrenSelector('.ui-state-highlight').removeClass('ui-state-highlight').attr('aria-selected', false);

					if (!silent && this.options.onItemUnselect) {
						this.options.onItemUnselect( this.selection );
					}

					this.selection = [];
				}
			},
			
 			addSelection: function(item) {

				if (!this.isSelected(item)) {
					this.selection.push(this.getItemId(item));					
				}
			},

			removeSelection: function(item) {
				if (!this.isSelected(item)) {					
					this.selection.splice(this.selection.indexOf(this.getItemId(item)), 1);
				}
			},

			getItemId: function(item) {
				return this.options.itemId !== undefined ? item[this.options.itemId] : item;
			},
			
			getCurrentPage: function() {
				return this.options.paginator ? this.paginator.getCurrentPage() : 0;
			},

			goToPage: function(page) {
				this.paginator.goToPage(page);
			}
		});

		return widget;
	}
	
	function DatalistDirective(widgetDatalist) {
		return {
			restrict: 'E',
			priority: 50,
			transclude: true,
			scope: true,
			link: function(scope, element, attrs, ctrl) {
				widgetDatalist.buildWidget(scope, element, attrs);
			},
			replace: true,
			template: widgetDatalist.template
		};
	}

}(window, document));