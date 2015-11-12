(function(window, document, undefined) {
	"use strict";
	
	angular.module('angularWidgets')			
		.factory('widgetDatalist', ['$compile', '$http', 'widgetBase', 'widgetPaginator', 'widgetFacet', DatalistWidget])
		.directive('wgDatalist', ['widgetDatalist', DatalistDirective]);

	function DatalistWidget($compile, $http, widgetBase, widgetPaginator, widgetFacet) {
			
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
			responsive: false // reflow, TODO flip-scroll
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

				this.transclude = divTransclude[0].innerHTML.trim();

				divTransclude.remove();
			},

			refresh: function() {

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

			renderListContent: function() {

                var $this = this;

				this.cleanAndDestroyChildrenScope();
				this.listContainer.children().remove();

				if (this.items.getData().length > 0) {

					angular.forEach(this.items.getData(), function (item, index) {
						
						var itemKey = $this.options.item ? $this.options.item : 'item',
							itemScope = $this.scope.$new(false, $this.scope);

						itemScope[itemKey] = item;

						// Store childscope for destroy
						$this.childrenScope.push(itemScope);
						
						// Determine item type
						var li = angular.element('<' + $this.listTag + '><' + $this.itemTag + ' class="pui-datalist-item"></' + $this.itemTag + '></' + $this.listTag + '>')
								.childrenSelector($this.itemTag)
								.addClass(index % 2 === 0 ? 'pui-even' : 'pui-odd');
						
						if ($this.options.itemStyleClass !== undefined) {
							li.addClass($this.options.itemStyleClass);
						}

						// Determine content
						if ($this.transclude !== '') {
							li.append($this.transclude);
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

						$this.listContainer.append(li);
					});
				}
				else {
					this.listContainer.append(angular.element('<li class="ui-datalist-item pui-datalist-empty-message">' + this.options.emptyMessage + '</li>'));
				}
            },

            cleanAndDestroyChildrenScope: function() {

				for (var i=0,l=this.childrenScope.length; i<l; i++) {
					this.childrenScope[i].$destroy();
				}

				this.childrenScope = [];
            },

			getFirst: function() {
				return this.options.paginator ? this.paginator.getFirst() : 0;
			},

			createRequest: function() {

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