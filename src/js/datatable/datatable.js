(function(window, document, undefined) {
	"use strict";
	
	angular.module('angularWidgets')			
		.factory('widgetDatatable', ['$compile', '$http', 'widgetBase', 'widgetColumn', 'widgetPaginator', 'widgetFacet', DatatableWidget])
		.directive('wgDatatable', ['widgetDatatable', DatatableDirective]);

	function DatatableWidget($compile, $http, widgetBase, widgetColumn, widgetPaginator, widgetFacet) {
			
		AngularWidgets.configureWidget('datatable', {
			emptyMessage: 'No rows found.',
			item: 'item',
			itemId: null,
			items: [],
			value: [],
			caption: null,
			selectionMode: null,
			onRowSelect: null,			
			onRowUnselect: null,
			rows: 10,
			paginator: false,
			onBuildRow: null,
			loadOnRender: true,
			loadOnDemand: false,
			responsive: false // reflow, TODO flip-scroll
		});

		var widget = {};

		widget.template = '<div class="pui-datatable ui-widget"><div class="pui-datatable-tablewrapper"><div ng-transclude></div><table><thead class="pui-datatable-data-head"></thead><tbody class="pui-datatable-data"></tbody></table></div></div>';

		widget.buildWidget = function(scope, element, attrs) {
			return new widget.DataTable(scope, element, attrs);
		};

		widget.create = function(scope, container, options) {

			var element = angular.element(this.template);

			container.append(element);

			return new widget.DataTable(scope, element, options);
		};

		widget.DataTable = function DataTable(scope, element, options) {

			this.columns = [];
			this.options = {};
			this.element = element;
			this.scope = scope;
			this.selection = [];
			this.firstLoad = true;
			this.sorts = [];
			this.childrenScope = [];

			this.constructor = function(scope, element, options) {

				this.table = this.element.findAllSelector('table');
				this.tableWrapper = this.table.parent();

				this.determineOptions(options);

				this.setItems(this.options.itemsBind ? this.scope.$eval(this.options.items) : this.options.items);

				var $this = this;

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

				if (this.options.columns) {
					this.columns = this.options.columns;
				}

				if (!this.columns.length) {
					this.determineColumnInfo();
				}

				if (this.options.responsive) {
					this.element.addClass('pui-datatable-reflow');
				}

				this.buildFacets();
				this.buildCaption();
				this.buildColumnHeaders();
				this.renderBody();

				if (this.isSortingEnabled()) {
					this.initSorting();
				}

				this.changeScope();

				widgetBase.createBindAndAssignIfNecessary(this, "getCurrentPage,goToPage,refresh");

				if (this.options.loadOnRender) {
					this.refresh();
				}
			};

			this.addSelection = function(item) {

				if (!this.isSelected(item)) {
					if (this.options.itemId) {
						this.selection.push(this.getItemId(item));
					} 
					else {
						this.selection.push(item);
					}
				}
			};

			this.buildBody = function() {

				var tbody = this.table.childrenSelector("tbody");

				this.tbody = tbody;

				tbody.data("dataTable", this);

				var row = angular.element('<tr class="ui-widget-content" ng-repeat="' + this.options.item + ' in $getData()" wg-row-build ng-show="$getData().length > 0" />');

				tbody.append(row);

				var rowEmpty = angular.element('<tr class="ui-widget-content pui-datatable-empty-message" ng-show="$getData().length === 0"><td colspan="' + this.columns.length + '">' + this.options.emptyMessage + '</td></tr>');

				tbody.append(rowEmpty);

				for (var i = 0, t = this.columns.length; i < t; i++) {

					var column = this.columns[i], 
					td = angular.element('<table><tbody><tr><td/></tr></tbody></table>').findAllSelector('td');
					td.attr('data-title', column.headerText || column.field);

					if (column.contents) {
						td.append(column.contents);
					} 
					else {
						td.append(angular.element('<span ng-bind="' + this.options.item + '.' + column.field + '"></span>'));
					}

					row.append(td);
				}

				$compile(this.element.contents())(this.scope);
			};

			this.buildCaption = function() {
				if (this.options.caption) {
					this.caption = angular.element('<table><caption class="pui-datatable-caption ui-widget-header">' + this.options.caption + '</caption></table>')
								.childrenSelector('caption')
								.prependTo(this.table);
				}
			};

			this.buildFacets = function() {

				if (this.facets) {
					if (this.facets.header) {
						var header = angular.element('<div class="pui-datatable-header ui-widget-header ui-corner-top"></div>')
								.prependTo(this.element)
								.append(this.facets.header.transclude());                        
					}

					if (this.facets.footer) {                            
						var footer = angular.element('<div class="pui-datatable-footer ui-widget-header ui-corner-bottom"></div>')
								.appendTo(this.element)
								.append(this.facets.footer.transclude());
					}
				}
			};

			this.determineColumnInfo = function() {
				if (!this.isHttpDataSource()) {
					for (var property in this.items.allData[0]) {
						this.columns.push({
							element: null,
							field: property,
							headerText: property,
							sortable: false,
							sortBy: property
						});
					}
				}
			};

			this.buildColumnHeaders = function() {

				this.thead = this.element.findAllSelector('thead');

				if (this.columns) {

					var $this = this;

					var tr = angular.element('<table><thead><tr></tr></thead></table>')
								.findAllSelector('tr');

					angular.forEach(this.columns, function(column) {

						// Elements are created as child of div tag. And if not valid html, it is not created.
						var th = angular.element('<table><thead><tr><th class="ui-state-default"/></tr></thead></table>')
								.findAllSelector('th');

						th.data('sortBy', column.sortBy);

						if (column.headerText) {
							th.text(column.headerText);
						}

						if (column.sortable) {
							th.addClass('pui-sortable-column').append('<span class="pui-sortable-column-icon fa fa-fw fa-sort"></span>');
							th.data('order', 1);
						}

						tr.append(th);
					});

					this.thead.append(tr);
				}
			};

			this.getItemId = function(item) {
				return item[this.options.itemId];
			};

			this.changeScope = function() {

				var $this = this;

				if (this.options.itemsBind) {
					this.scope.$watch(this.options.items, function(newValue, oldValue) {
						if (newValue !== oldValue) {
							$this.setValue(newValue);
							$this.refresh();
						}
					});
				}
			};

			this.determineOptions = function(options) {					
				this.options = widgetBase.determineOptions(this.scope, AngularWidgets.getConfiguration().widgets.datatable, options, ['onRowSelect', 'onRowUnselect']);
				this.options.itemsBind = angular.isString(options.items);
			};

			this.createRequest = function() {

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
			};

			this.initSelection = function(tr, item) {

				tr.hover(function() {
					if (!tr.hasClass('ui-state-highlight')) {
						tr.addClass('ui-state-hover');
					}
				}, function() {
					if (!tr.hasClass('ui-state-highlight')) {
						tr.removeClass('ui-state-hover');
					}
				});

				var $this = this;

				tr.bind('click', function(e) {
					if (e.target.nodeName === 'TD') {
						var selected = tr.hasClass('ui-state-highlight'), 
						metaKey = event.metaKey || event.ctrlKey, 
						shiftKey = event.shiftKey;

						//unselect a selected row if metakey is on
						if (selected && metaKey) {
							$this.unselectRow(tr, false);
						} 
						else {
							//unselect previous selection if this is single selection or multiple one with no keys
							if ($this.isSingleSelection() || ($this.isMultipleSelection() && !metaKey && !shiftKey)) {
								$this.unselectAllRows();
							}

							$this.selectRow(tr, false);
						}
					}
				});
			};

			this.initSorting = function() {

				var sortableColumns = this.thead.childrenSelector('tr').childrenSelector('.pui-sortable-column');

				widgetBase.hoverAndFocus(sortableColumns);

				sortableColumns.hover(function() {
					var column = angular.element(this);
					if (!column.hasClass('ui-state-active')) {
						column.addClass('ui-state-hover');
					}
				}, function() {
					var column = angular.element(this);
					if (!column.hasClass('ui-state-active')) {
						column.removeClass('ui-state-hover');
					}
				});

				var $this = this;

				sortableColumns.click(function(e) {
					var column = angular.element(e.target.nodeName === 'TH' ? e.target : e.target.parentNode), 
					sortBy = column.data('sortBy'), 
					order = column.data('order'), 
					siblings = column.siblings(), 
					activeColumns = AngularWidgets.filter(siblings, function(item) {
						return angular.element(item).hasClass('ui-state-active');
					}), 
					sortIcon = column.childrenSelector('.pui-sortable-column-icon');

					if (activeColumns.length > 0) {
						angular.forEach(activeColumns, function(activeColumn) {
							angular.element(activeColumn)
							.data('order', 1)
							.removeClass('ui-state-active')
							.children('span.pui-sortable-column-icon')
							.removeClass('ui-icon-triangle-1-n ui-icon-triangle-1-s');
						});
					}

					$this.sort(sortBy, order == 1 ? 'ASC' : 'DESC');

					//update state
					column.data('order', -1 * order);

					column.removeClass('ui-state-hover').addClass('ui-state-active');
					sortIcon.removeClass('ui-icon-carat-2-n-s');
					if (order === -1) {
						sortIcon.removeClass('fa-sort-asc').addClass('fa-sort-desc');
					} 
					else if (order === 1) {
						sortIcon.removeClass('fa-sort-desc').addClass('fa-sort-asc');
					}
				});
			};

			this.isHttpDataSource = function() {
				return this.items instanceof window.AngularWidgets.HttpDataSource;
			};

			this.isSingleSelection = function() {
				return this.options.selectionMode === 'single';
			};

			this.isMultipleSelection = function() {
				return this.options.selectionMode === 'multiple';
			};

			this.isSortingEnabled = function() {

				if (this.columns) {
					for (var i = 0, t = this.columns.length; i < t; i++) {
						if (this.columns[i].sortable) {
							return true;
						}
					}
				}

				return false;
			};

			this.determineTransclude = function() {

				var divTransclude = angular.element(this.element.children()[0]).children()[0];

				var columns = widgetColumn.determineColumnsOptions(divTransclude);

				this.facets = widgetFacet.determineFacetsOptions(divTransclude);

				if (columns) {
					this.columns = columns;
				}

				// Delete transclude div
				angular.element(divTransclude).remove();
			};

			this.refresh = function() {

				var $this = this;

				this.dataModel.load(this.createRequest(),
					function() {
						$this.onLoadData();
					},
					function(response) {
						/* TODO - Tratar erros */
						alert(response);
					}
				);
			};

			this.onLoadData = function() {

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

				this.renderRows();

				if (this.options.loadOnDemand && this.onDemandLoader === undefined) {
					
					this.onDemandLoader = angular.element('<div class="pui-datatable-loader"></div>');

					this.element.append(this.onDemandLoader);

					var watcher = scrollMonitor.create(this.onDemandLoader);

					var $this = this;
					
					watcher.enterViewport(function() {
						if ($this.dataModel.hasMoreRows()) {							
							var tr = angular.element('<tr class="ui-widget-content pui-datatable-loader"><td colspan="' + $this.columns.length + '"><i class="fa fa-2x fa-spinner fa-pulse"></i></td></tr>');
							$this.tbody.append(tr);
							$this.onDemandDataModel.nextPage();
						}
					});
				}		
			};

			this.renderBody = function() {
				this.tbody = this.table.childrenSelector("tbody");
			};

			this.removeRow = function(row) {
				var scope = row.data('itemScope');				
				if (scope) scope.$destroy();
				row.remove();
			},

			this.removeRows = function(rows) {				
				for (var i=0,t=rows.length; i<t; i++) {
					this.removeRow(angular.element(rows[i]));
				}				
			},

			this.renderRows = function() {
								
 				var $this = this;

				var children = Array.prototype.slice.call(this.tbody.children());

				if ($this.dataModel.getData().length > 0) {

					angular.forEach($this.dataModel.getData(), function (item, index) {
						
						var oldTr;

						if (children.length > 0) {							
							oldTr = angular.element(children[0]);
						}

						var itemKey = $this.options.item ? $this.options.item : 'item',
							itemScope = $this.scope.$new(false, $this.scope);

						itemScope[itemKey] = item;
						
						var tr = angular.element('<tr class="ui-widget-content">')
									.addClass(index % 2 === 0 ? 'pui-even' : 'pui-odd');

						// Store childscope for destroy
						tr.data('itemScope', itemScope);

						for (var i = 0, t = $this.columns.length; i < t; i++) {

							var column = $this.columns[i], 
							td = angular.element('<table><tbody><tr><td/></tr></tbody></table>').findAllSelector('td');
							td.attr('data-title', column.headerText || column.field);

							if (column.contents) {
								td.append(column.contents);
							} 
							else {
								td.append(angular.element('<span ng-bind="' + itemKey + '.' + column.field + '"></span>'));
							}

							tr.append(td);
						}
						
						tr.data('item', item);

						if ($this.options.selectionMode) {
							$this.initSelection(tr, item);
						}

						if ($this.options.selectionMode && $this.isSelected(item)) {
							tr.addClass("ui-state-highlight");
						}
						
						//if ($this.options.onBuildRow) {
						//	$this.options.onBuildRow(this, scope, element, attrs);
						//}

						$compile(tr)(itemScope);
						
						if (oldTr) {							
							oldTr.after(tr);							
							$this.removeRow(oldTr);
							children.shift();
						}
						else {
							$this.tbody.append(tr);
						}						
					});

					$this.removeRows(children);
				}
				else {
					$this.removeRows(children);

					$this.tbody.append(angular.element('<tr class="ui-widget-content pui-datatable-empty-message"><td colspan="' + this.columns.length + '">' + this.options.emptyMessage + '</td></tr>'));
				}
            },

			this.cleanAndDestroyChildrenScope = function() {

				for (var i=0,l=this.childrenScope.length; i<l; i++) {
					this.childrenScope[i].$destroy();
				}

				this.childrenScope = [];
            };

			this.clearSelection = function() {
				this.selection = [];
			};

			this.removeSelection = function(item) {

				if (!this.isSelected(item)) {
					if (this.options.itemId) {
						this.selection.splice(this.selection.indexOf(this.getItemId(item)), 1);
					} 
					else {
						this.selection.splice(this.selection.indexOf(item), 1);
					}
				}
			};

			this.selectRow = function(row, silent) {

				var item = row.data('item');

				row.removeClass('ui-state-hover').addClass('ui-state-highlight').attr('aria-selected', true);

				this.addSelection(item);

				if (!silent && this.options.onRowSelect) {
					this.options.onRowSelect('rowSelect', item);
				}
			};

			this.setItems = function(value) {
				this.items = widgetBase.determineDataSource(value);
			};

			this.sort = function(attribute, order) {

				this.sorts = [{ attribute: attribute, order: order }];

				this.refresh();
			};

			this.getCurrentPage = function() {
				return this.options.paginator ? this.paginator.getCurrentPage() : 0;
			};

			this.goToPage = function(page) {
				this.paginator.goToPage(page);
			};

			this.unselectAllRows = function(silent) {
				
				if (this.selection.length > 0) {

					this.tbody.children('tr.ui-state-highlight').removeClass('ui-state-highlight').attr('aria-selected', false);

					if (!silent && this.options.onRowUnselect) {
						this.options.onRowUnselect('rowUnselectAll', null);
					}

					this.selection = [];
				}
			};

			this.unselectRow = function(row, silent) {

				var item = row.data('item');

				row.removeClass('ui-state-highlight').attr('aria-selected', false);

				this.removeSelection(item);

				if (!silent && this.options.onRowUnselect) {
					this.options.onRowUnselect('rowUnselect', item);
				}
			};

			this.isSelected = function(item) {
				return AngularWidgets.inArray(this.selection, this.options.itemId ? this.getItemId(item) : item);
			};

			this.constructor(scope, element, options);
		};

		return widget;
	}
	
	function DatatableDirective(widgetDatatable) {
		return {
			restrict: 'E',
			priority: 50,
			transclude: true,
			scope: true,
			link: function(scope, element, attrs, ctrl) {
				widgetDatatable.buildWidget(scope, element, attrs);
			},
			replace: true,
			template: widgetDatatable.template
		};
	}

}(window, document));