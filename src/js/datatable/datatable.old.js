/*globals angular event AngularWidgets */

(function(window, document, undefined) {
    "use strict";

    angular.module('pje.ui').factory('widgetDatatable', ['widgetBase', 'datatablePaginator', function (widgetBase, datatablePaginator) {


        var widgetDatatable = {};

        widgetDatatable.determineOptions = function (scope, element, attrs) {
            var _options =  scope.$parent.$eval(attrs.binding) || {},
                tableData = scope.$parent.$eval(attrs.value);
             
            scope.tableData = tableData;
            
            _options.item = attrs.item || 'item';  
            
            if (angular.isArray(tableData)) {
                _options = {
                    tableData : tableData,
                    functionBasedData : false
                };
            }
            if (angular.isFunction(tableData)) {
                _options = {
                    tableData : tableData,
                    functionBasedData : true
                };
            }

            return _options;
        };

        widgetDatatable.buildWidget = function(scope, attrs, element, options) {
            var _columns = element.findAllSelector('pui-column'),
                columns = [],
                datatableData = {};

            if (options.paginator || attrs.paginator) {
                datatableData.paginatorData = datatablePaginator.buildWidget(scope, element, attrs, options);
            }

            angular.forEach(_columns, function(column) {
                this.push(angular.element(column).data('options'));
            }, columns);

            datatableData.options = options;
            datatableData.data = options.tableData;
            datatableData.selection = [];
            datatableData.columns = columns;
            _columns.remove();

            this.determineColumnInfo(options, columns);

            datatableData.thead = element.findAllSelector('thead');
            datatableData.tbody = element.findAllSelector('tbody');
            datatableData.element = element;

            return datatableData;

        };

        widgetDatatable.determineColumnInfo = function (options, columns) {
            if (columns.length === 0) {
                if (options.columns) {
                    columns = options.columns;
                }
                if (!options.functionBasedData && columns.length === 0) {
                    for (var property in options.tableData[0]) {
                        columns.push({field: property, headerText: property});
                    }
                }
            }
            options.columns = columns;
        };

        widgetDatatable.handleDataLoad = function (datatableData) {
            return function (data) {
                datatableData.data = data;
                if (!datatableData.data) {
                    datatableData.data = [];
                }

                if (datatableData.options.columns.length === 0) {
                    for (var property in data[0]) {
                        datatableData.options.columns.push({field: property, headerText: property});
                    }
                }


                widgetDatatable.initialize(datatableData);
            };
        };

        widgetDatatable.showWidget = function(datatableData) {
            if (datatableData.data) {
                if (datatableData.options.functionBasedData) {
                    var handleDataLoadObj = new widgetDatatable.handleDataLoad(datatableData);
                    datatableData.options.tableData.call(this, handleDataLoadObj);
                } else {

                    widgetDatatable.initialize(datatableData);
                }

            }

        };

        widgetDatatable.initialize = function(datatableData) {
            var options = datatableData.options;

            if(options.caption) {
                var caption = angular.element('<table><caption class="pui-datatable-caption ui-widget-header">' + options.caption + '</caption></table>');
                datatableData.element.findAllSelector('table').append(caption.childrenSelector('caption'));
            }

            this.renderColumnHeaders(datatableData);

            if (options.paginator) {
                datatableData.element.after(datatableData.paginatorData.paginatorContainer);

                datatablePaginator.initialize(datatableData.paginatorData, datatableData.data, function() {
                    widgetDatatable.renderData(datatableData);
                });
            }

            if(this.isSortingEnabled(datatableData)) {
                this.initSorting(datatableData);
            }


            this.renderData(datatableData);
        };

        widgetDatatable.renderColumnHeaders = function (datatableData) {
            if (datatableData.options.columns) {
                angular.forEach(datatableData.options.columns, function (column) {
                    // Elements are created as child of div tag. And if not valid html, it is not created.
                    var headerInTable = angular.element('<table><thead><th class="ui-state-default"/></thead></table>'),
                        header = headerInTable.findAllSelector('th');
                    header.data('sortBy', column.sortBy);
                    datatableData.thead.append(header);

                    if (column.headerText) {
                        header.text(column.headerText);
                    }

                    if (column.sortable) {
                        header.addClass('pui-sortable-column').data('order', 1).append('<span class="pui-sortable-column-icon ui-icon ui-icon-carat-2-n-s"></span>');
                        header.data('order', 1);
                    }
                });

            }
        };

        widgetDatatable.renderData = function (datatableData) {
            if(datatableData.data) {
                var first = this.getFirst(datatableData),
                    rows = this.getRows(datatableData),
                    totalRecords = datatableData.data.length;

                datatableData.tbody.html('');

                /*for(var i = first; i < (first + rows) && i < totalRecords; i++) {
                    var rowData = datatableData.data[i],
                        rowKey = rowData[datatableData.options.rowKey];

                    if(false) {//rowData) {
                        // Elements are created as child of div tag. And if not valid html, it is not created.
                        var rowInTable = angular.element('<table><tbody><tr class="ui-widget-content" /></tbody></table>'),
                            row = rowInTable.findAllSelector('tr'),
                            zebraStyle = (i%2 === 0) ? 'pui-datatable-even' : 'pui-datatable-odd';
                        
                        datatableData.tbody.append(row);
                        row.addClass(zebraStyle);

                        if(datatableData.options.selectionMode) {
                            row.data('rowKey', rowKey );
                            row.data('rowData', rowData);
                            this.initSelection(datatableData, row);
                        }


                        if (datatableData.options.selectionMode && this.isSelected(datatableData, rowKey)) {
                            row.addClass("ui-state-highlight");
                        }

                        for(var j = 0; j < datatableData.options.columns.length; j++) {
                        	
                        	var columnOptions = datatableData.options.columns[j],                        	
                        		columnInTable = angular.element('<table><tbody><tr><td/></tr></tbody></table>'),
                        		column = columnInTable.findAllSelector('td'),
                        		columnInnerHtml = columnOptions.element.html().trim();    
                        	
                        	if (columnInnerHtml != '') {
                        		column.text(columnInnerHtml);
                        	}
                        	else {
                                var fieldValue = rowData[columnOptions.field];
                                column.text(fieldValue);
                        	}
                        	
                        	row.append(column);
                        }

                    }
                    
                    if (row) { 
                    }
                }*/
                
                var rowInTable = angular.element('<table><tbody><tr class="ui-widget-content" ng-repeat="item in tableData" /></tbody></table>'),
                	row = rowInTable.findAllSelector('tr');
                //zebraStyle = (i%2 === 0) ? 'pui-datatable-even' : 'pui-datatable-odd';
                
                datatableData.tbody.append(row);

            	//tr += ' ng-class="$even ? \'pui-datatable-even\' : \'pui-datatable-odd\'"';
            	//tr += ' >';
            		
        		for(var j = 0; j < datatableData.options.columns.length; j++) {
            		
            		var columnOptions = datatableData.options.columns[j],                        	
                		columnInTable = angular.element('<table><tbody><tr><td/></tr></tbody></table>'),
                		column = columnInTable.findAllSelector('td'),
                		columnInnerHtml = columnOptions.element.html().trim();    
                	
                	if (columnInnerHtml != '') {
                		column.text(columnInnerHtml);
                	}
                	else {
                        column.text("{{item." + columnOptions.field + "}}");
                	}
                	
                	row.append(column);
            	}
            }
        };

        widgetDatatable.initSelection = function(datatableData, row) {
            row.hover(function () {
                if (!row.hasClass('ui-state-highlight')) {
                    row.addClass('ui-state-hover');
                }
            }, function () {
                if (!row.hasClass('ui-state-highlight')) {
                    row.removeClass('ui-state-hover');
                }
            });

            row.bind('click', function(e) {
                if (e.target.nodeName === 'TD') {
                    var selected = row.hasClass('ui-state-highlight'),
                        metaKey = event.metaKey||event.ctrlKey,
                        shiftKey = event.shiftKey,
                        $this = widgetDatatable;

                    //unselect a selected row if metakey is on
                    if(selected && metaKey) {
                        $this.unselectRow(datatableData, row, false);
                    }
                    else {
                        //unselect previous selection if this is single selection or multiple one with no keys
                        if($this.isSingleSelection(datatableData) || ($this.isMultipleSelection(datatableData) && !metaKey && !shiftKey)) {
                            $this.unselectAllRows(datatableData);
                        }

                        $this.selectRow(datatableData, row, false);
                    }

                }

            });
        };

        widgetDatatable.getFirst = function(datatableData) {
            if(datatableData.options.paginator) {
                var page = datatableData.paginatorData.page,
                    rows = datatableData.paginatorData.rows;

                return (page * rows);
            }
            else {
                return 0;
            }
        };

        widgetDatatable.isSortingEnabled = function(datatableData) {
            var cols = datatableData.options.columns;
            if(cols) {
                for(var i = 0; i < cols.length; i++) {
                    if(cols[i].sortable) {
                        return true;
                    }
                }
            }

            return false;
        };

        widgetDatatable.getRows = function(datatableData) {
            return datatableData.options.paginator ? datatableData.paginatorData.rows : datatableData.data.length;
        };

        widgetDatatable.initSorting = function(datatableData) {
            var sortableColumns = datatableData.thead.childrenSelector('.pui-sortable-column');

            widgetBase.hoverAndFocus(sortableColumns);

            sortableColumns.hover(function () {
                var column = angular.element(this);
                if (!column.hasClass('ui-state-active')) {
                    column.addClass('ui-state-hover');
                }
            }, function () {
                var column = angular.element(this);
                if (!column.hasClass('ui-state-active')) {
                    column.removeClass('ui-state-hover');
                }
            });


            sortableColumns.click(function(e) {
                var column =  angular.element(e.target.nodeName === 'TH' ? e.target : e.target.parentNode ),
                    field = column.data('field'),
                    order = column.data('order'),
                    siblings = column.siblings(),
                    activeColumn = AngularWidgets.filter(siblings,function (item) {
                        return angular.element(item).hasClass('ui-state-active');
                    }),
                    sortIcon = column.childrenSelector('.pui-sortable-column-icon');

                if (activeColumn.length > 0) {
                    activeColumn.data('order', 1).removeClass('ui-state-active').children('span.pui-sortable-column-icon')
                        .removeClass('ui-icon-triangle-1-n ui-icon-triangle-1-s');
                }

                widgetDatatable.sort(datatableData, field, order);

                //update state
                column.data('order', -1 * order);

                column.removeClass('ui-state-hover').addClass('ui-state-active');
                sortIcon.removeClass('ui-icon-carat-2-n-s');
                if (order === -1) {
                    sortIcon.removeClass('ui-icon-triangle-1-n').addClass('ui-icon-triangle-1-s');
                }
                else if (order === 1) {
                    sortIcon.removeClass('ui-icon-triangle-1-s').addClass('ui-icon-triangle-1-n');
                }

            });
        };

        widgetDatatable.sort =  function(datatableData, field,order) {
            datatableData.data.sort(function(data1, data2) {
                var value1 = data1[field],
                    value2 = data2[field],
                    result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

                return (order * result);
            });

            this.renderData(datatableData);
        };

        widgetDatatable.isSingleSelection = function(datatableData) {
            return datatableData.options.selectionMode === 'single';
        };

        widgetDatatable.isMultipleSelection = function(datatableData) {
            return datatableData.options.selectionMode === 'multiple';
        };

        widgetDatatable.getRowKeyValue = function( row) {
            return row.data('rowKey');
        };

        widgetDatatable.getRowData = function( row) {
            return row.data('rowData');
        };

        widgetDatatable.unselectAllRows = function(datatableData, silent) {
            datatableData.tbody.children('tr.ui-state-highlight').removeClass('ui-state-highlight').attr('aria-selected', false);

            if (!silent && datatableData.options.onRowUnselect) {

                datatableData.options.onRowUnselect('rowUnselectAll', null);
            }
            datatableData.selection = [];

        };

        widgetDatatable.unselectRow = function (datatableData, row, silent) {
            var rowKey = this.getRowKeyValue(row),
                rowValue = widgetDatatable.getRowData(row);
            row.removeClass('ui-state-highlight').attr('aria-selected', false);

            this.removeSelection(datatableData, rowKey);

            if (!silent && datatableData.options.onRowUnselect) {
                datatableData.options.onRowUnselect('rowUnselect', rowValue);
            }

        };

        widgetDatatable.removeSelection = function(datatableData, rowKey) {
            if (this.isSelected(datatableData, rowKey)) {
                datatableData.selection.splice(datatableData.selection.indexOf(rowKey), 1);
            }
        };

        widgetDatatable.selectRow = function(datatableData, row, silent) {

            var rowKey = widgetDatatable.getRowKeyValue(row),
                rowValue = widgetDatatable.getRowData(row);
            row.removeClass('ui-state-hover').addClass('ui-state-highlight').attr('aria-selected', true);

            widgetDatatable.addSelection(datatableData, rowKey);

            if(!silent && datatableData.options.onRowSelect) {
                datatableData.options.onRowSelect('rowSelect', rowValue);
            }
        };

        widgetDatatable.addSelection = function (datatableData, rowKey) {

            if (!this.isSelected(datatableData, rowKey)) {
                datatableData.selection.push(rowKey);
            }

        };

        widgetDatatable.isSelected = function(datatableData, rowKey) {
            return AngularWidgets.inArray(datatableData.selection, rowKey);
        };

        widgetDatatable.addInteractionFunctions = function (datatableData, options) {
            if (options.selectionMode) {
                options.addSelection = function (key) {
                    widgetDatatable.addSelection(datatableData, key);
                    widgetDatatable.renderData(datatableData);
                };
                options.removeSelection = function (key) {
                    widgetDatatable.removeSelection(datatableData, key);
                    widgetDatatable.renderData(datatableData);
                };
                options.removeAllSelection = function () {
                    widgetDatatable.unselectAllRows(datatableData, true);
                };
            }
            if (options.paginator) {
                options.setPaginationPage = function(page) {
                    datatablePaginator.setPage(datatableData.paginatorData, page);
                };
            }
        };

        return widgetDatatable;

    }]);

    angular.module('pje.ui').directive('puiDatatable', ['widgetDatatable', function (widgetDatatable) {
        var linkFn = function (scope, element, attrs) {
            var options = widgetDatatable.determineOptions(scope, element, attrs),
                datatableData = widgetDatatable.buildWidget(scope, attrs, element, options);

            widgetDatatable.showWidget(datatableData);
            widgetDatatable.addInteractionFunctions(datatableData, options);
        };
        return {
            restrict: 'E',
            //replace: true,
            transclude: true,
            scope: {
            	tableData	: '=',
            	item		: '='
            },
            template: '<div class="pui-datatable-tablewrapper pui-datatable ui-widget" ><table><thead></thead><tbody class="pui-datatable-data"></tbody> </table></div> ',
            link: linkFn
        };

    }]);

    angular.module('pje.ui').directive('puiColumn', function () {
        var linkFn = function (scope, element, attrs) {
        	
        	var options = {
        		field 		: attrs.value,
        		sortable 	: attrs.sortable || ( attrs.sortBy != null ? true : false ),
        		sortBy		: attrs.sortby || attrs.value,
        		headerText	: attrs.headertext || fieldName,
        		element		: element
        	};
        	
            element.data("options", options);
        };
        return {
            restrict: 'E',
            priority: 5,
            link : linkFn
        };
    });
}(window, document));