(function(window, document, undefined) {
	"use strict";
	
	angular.module('angularWidgets')			
		.factory('widgetDatatable', ['$compile', '$http', 'widgetBase', 'widgetColumn', 'widgetPaginator', 'widgetFacet', DatatableWidget])
		.directive('wgDatatable', ['widgetDatatable', DatatableDirective])
		.directive('wgRowBuild', RowBuildDirective);

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

			this.constructor = function(scope, element, options) {

				this.table = this.element.findAllSelector('table');

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

				if (this.isSortingEnabled()) {
					this.initSorting();
				}

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

			this.buildRow = function(scope, element, attrs) {

				var item = scope[this.options.item];

				// Share item with autocomplete call onBuildRow
				element.data('item', item);

				if (this.options.selectionMode) {
					this.initSelection(element);
				}

				if (this.options.selectionMode && this.isSelected(item)) {
					element.addClass("ui-state-highlight");
				}

				scope.$watch('$even', function(newValue, oldValue) {
					if (newValue) {
						element.addClass('pui-even').removeClass('pui-odd');
					} 
					else {
						element.addClass('pui-odd').removeClass('pui-even');
					}
				});

				if (this.options.onBuildRow) {
					this.options.onBuildRow(this, scope, element, attrs);
				}
			};

			this.getItemId = function(item) {
				return item[this.options.itemId];
			};

			this.changeScope = function() {

				var $this = this;

				this.scope.$getData = function() {
					return $this.items.getData();
				};

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

			this.getFirst = function() {
				return this.options.paginator ? this.paginator.getFirst() : 0;
			};

			this.getPageSize = function() {
				return this.options.paginator ? this.paginator.getRows() : this.items.getRowCount();
			};

			this.createRequest = function() {

				var request = {
					first: this.getFirst(),
					sorts: this.sorts
				};

				if (this.restriction) {

					request.restriction = this.restriction.createRequest();

					if (!AngularWidgets.equals(this.lastRestriction, request.restriction)) {
						request.first = 0;
						this.paginator.page = 0;
					}				

					this.lastRestriction = request.restriction;
				}

				if (this.paginator) {
					request.pageSize = this.paginator.getRows();
				}

				return request;
			};

			this.initSelection = function(row) {

				row.hover(function() {
					if (!row.hasClass('ui-state-highlight')) {
						row.addClass('ui-state-hover');
					}
				}, function() {
					if (!row.hasClass('ui-state-highlight')) {
						row.removeClass('ui-state-hover');
					}
				});

				var $this = this;

				row.bind('click', function(e) {
					if (e.target.nodeName === 'TD') {
						var selected = row.hasClass('ui-state-highlight'), 
						metaKey = event.metaKey || event.ctrlKey, 
						shiftKey = event.shiftKey;

						//unselect a selected row if metakey is on
						if (selected && metaKey) {
							$this.unselectRow(row, false);
						} 
						else {
							//unselect previous selection if this is single selection or multiple one with no keys
							if ($this.isSingleSelection() || ($this.isMultipleSelection() && !metaKey && !shiftKey)) {
								$this.unselectAllRows();
							}

							$this.selectRow(row, false);
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

				if (this.items !== null && this.items !== undefined) {
					this.items.load(this.createRequest())
					.success(function(request) {
						$this.onLoadData();
					})
					.error(function(response) {
						/* TODO - Tratar erros */
						alert(response);
					});
				}
			};

			this.onLoadData = function() {

				if (this.firstLoad) {

					this.firstLoad = false;

					this.changeScope();

					this.buildBody();

					if (this.options.paginator) {
						this.paginator.render();
					}
				} 
				else {
					if (this.options.paginator) {
						this.paginator.update();
					}
				}
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
	
	function RowBuildDirective() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs, ctrl) {
				var dataTable = element.parent().data('dataTable');
				dataTable.buildRow(scope, element, attrs);
			}
		};
	}

}(window, document));