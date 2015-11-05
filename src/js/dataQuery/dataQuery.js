(function(window, document, undefined) {
    "use strict";

	AngularWidgets.DataQuery = DataQuery;

	function DataQuery(data) {

		var queryWhere = null;
		var querySort = new DataQuerySort(this);
		var firstResult = -1;
		var maxResults = -1;

		this.getAttributeValueByPath = getAttributeValueByPath;
		this.getData = getData;
		this.getFirstResult = getFirstResult;
		this.getMaxResults = getMaxResults;
		this.where = where;
		this.select = select;
		this.setFirstResult = setFirstResult;
		this.setMaxResults = setMaxResults;
		this.sort = sort;

		function getAttributeValueByPath(item, path) {
			/* TODO - item.subobj.subobj.value */
			return item[path];
		}

		function getData() {
			return data;
		}

		function getFirstResult() {
			return firstResult;
		}

		function getMaxResults() {
			return maxResults;
		}

		function where(operator) {

			if (queryWhere === null || operator !== undefined) {

				operator = operator || 'AND';

				if (operator === 'AND') {
					queryWhere = new DataQueryExpression('AND', this);
					return queryWhere;
				}
				else {
					queryWhere = new DataQueryExpression('OR', this);
					return queryWhere;
				}				
			} 
			else {
				return queryWhere;
			}
		}

		function select() {

			var processedData = null;

			if (queryWhere) {

				processedData = [],
				data = this.getData();

				for (var i=0, l=data.length; i<l; i++) {
					if (queryWhere.process(data[i])) {
						processedData.push(data[i]);
					}
				}
			}
			else {
				processedData = this.getData();
			}
		
			querySort.process(processedData);
			
			if (firstResult !== -1 || maxResults !== -1) {

				var rowCount = processedData.length,
					rows = maxResults !== -1 ? maxResults : rowCount,
					first = firstResult !== -1 ? firstResult : 0,
					pageLimit = first + rows;
	
				var pagedData = [];

				for (var i = first; i < (pageLimit) && i < rowCount; i++) {
					pagedData.push(processedData[i]);
				}

				return pagedData;
			}
			else {
				return processedData;
			}
		}

		function setFirstResult(v) {
			if (AngularWidgets.isNumber(v)) {
				firstResult = v;
			}
		}

		function setMaxResults(v) {
			if (AngularWidgets.isNumber(v)) {
				maxResults = v;	
			}			
		}

		function sort() {
			return querySort;
		}
	}

	function DataQuerySort(parentValue) {

		var sorts = [];

		this.asc = asc;	
		this.clear = clear;
		this.desc = desc;
		this.parent = parent;	
		this.process = process;

		// Public
		function asc(attribute) {
			sorts.push({ attribute: attribute, order: 'ASC' });
			return this;
		}	

		function clear() { 
			sorts = [];
			return this;
		}

		function desc(attribute) {
			sorts.push({ attribute: attribute, order: 'DESC' });
			return this;
		}

		function parent() {
			return parentValue;
		}

		function process(data) {
			
			if (sorts.length) {
				data.sort(function(v1, v2) {					
					return sortCompare(0, v1, v2);
				});
			}
		}
		
		// Private
		function sortCompare(index, v1, v2) {

			var sort = sorts[index],
				v1Attribute = parent().getAttributeValueByPath(v1, sort.attribute),
				v2Attribute = parent().getAttributeValueByPath(v2, sort.attribute);

			if (v1Attribute == v2Attribute) {
				return (index < sorts.length - 1) ? sortCompare(++index, v1, v2) : 0;
			}
			else {
				var result = v1Attribute > v2Attribute ? 1 : -1;

				var order = sort.order == "ASC" ? 1 : -1

				return (order * result);
			}

		}	
	}

	function DataQueryExpression(operator, parentValue) {

		var operator = operator;
		var expressions = [];

		this.add = add;
		this.addAnd = addAnd;
		this.addOr = addOr;
		this.process = process;

		function add(fct) {

			expressions.push(fct);

			return this;
		}

		function addAnd() {
			var and = new DataQueryExpression('AND', this);
			expressions.push(and);
			return and;
		}

		function addOr() {
			var or = new DataQueryExpression('OR', this);
			expressionspush(or);
			return or;
		}

		function process(item) {
			
			var resultFinal;

			for (var i=0, l=expressions.length; i<l; i++) {	

				var exp = expressions[i],
					result = null;

				if (AngularWidgets.isFunction(exp))	{				
					result = exp(item);
				}
				else {
					result = exp.process(item);
				}

				if (operator === 'AND' && result === false) {
					return false;
				}
				else if (operator === 'OR' && result === true) {
					return true;
				}
			}

			if (operator === 'AND') {
				return true;
			}
			else {
				return false;
			}
		}

		function parent()  {
			return parentValue;
		}
	}

	AngularWidgets.DataFilter = {

		check: function( data, value, operator, sensitive) {

			operator = operator.toUpperCase();

			data = data !== null && data !== undefined ? data : '';

			if (AngularWidgets.isString(data)) {

				if (sensitive) {
					data = data.toUpperCase();
					value = value.toUpperCase();
				}

				if (operator === 'START_WITH' && data.indexOf(value) === 0) {
					return true;
				}
				else if (operator === 'CONTAINS' && data.indexOf(value) !== -1) {
					return true;
				}
				else if (operator === 'EQUALS' && data == value) {
					return true;
				}
				else if (operator === 'NOT_EQUALS' && data != value) {
					return true;
				}
				else {
					return false;
				}
			}
			else if (AngularWidgets.isNumber(data)) {

				if (operator === 'GE' && data >= value) {
					return true;
				}
				else if (operator === 'GT' && data > value) {
					return true;
				}
				else if (operator === 'LE' && data <= value) {
					return true;
				}
				else if (operator === 'LT' && data < value) {
					return true;
				}
				else if (operator === 'EQUALS' && data == value) {
					return true;
				}
				else if (operator === 'NOT_EQUALS' && data != value) {
					return true;
				}
				else {
					return false;
				}
			}

			return false;
		}
	}

}(window, document));