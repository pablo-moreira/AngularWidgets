(function(window, document, undefined) {
    "use strict";

	AngularWidgets.Expression = Expression;
	AngularWidgets.Restriction = Restriction;

	function Restriction(options) {
		
		var expression = null;
		var type = null;

		this.r = {};
		this.init = init;
		this.isSimple = isSimple;
		this.add = add;
		this.getExpression = getExpressions;
		this.createRequest = createRequest;

		this.init(options);

		function init(options) {

			var exps;

			if (AngularWidgets.isArray(options)) {
				exps = options;
				type = "S";
				expression = new Expression('AND');
			}
			else {
				exps = options.expressions || [];
				expression = new Expression(options.operator || 'AND');
				type = "C";
			}

			for (var i=0, l=exps.length; i<l; i++) {
				this.add(exps[i]);
			}
		} 
	
		function isSimple() {
			return type === "S";
		}
		
		function isComplex() {
			return type === "C";
		}

		function add(options) {
			
			if (options.expressions || options.operator !== undefined && options.operator === 'AND' || options.operator === 'OR') {
				
				var opts = {
					operator : options.operator || 'AND'
				};

				expression.add(new Expression(opts));
			}
			else {

				var filter = new Filter(options);

				if (this.r[filter.id] !== undefined) {
					throw new Error('Restriction - The filter id: ' + filter.id + ' has already been set, set the other id for the filter. If you did not set the value of id the value of attribute that was used.');
				}

				this.r[filter.id] = filter;

				expression.add(filter);
			}
		};

		function getExpressions() {
			return expression.getExpressions();
		};		 
		
		function createRequest() {
			if (this.isSimple()) {
				return expression.createRequestParamForSimpleRestriction();
			}
			else {
				return expression.createRequestParamForComplexRestriction();
			}
		}
 	}

	function Expression(operator) {
		
		var expressions = [];
		var operator = operator || 'AND';
		
// 		this.init = init;
		this.add = add;
		this.getExpressions = getExpressions;
		this.getOperator = getOperator;
		this.setOperator = setOperator;
		this.getFilters = getFilters;
		this.createRequestParamForSimpleRestriction = createRequestParamForSimpleRestriction;
		this.createRequestParamForComplexRestriction = createRequestParamForComplexRestriction;

// 		this.init(options);

// 		function init(options) {

// 			var exps;

// 			exps = options.expressions || [];
// 			operator = options.expressions || 'AND';
			

// 			for (var i=0, l=exps.length; i<l; i++) {
// 				this.add(exps[i]);
// 			}
// 		}

		function add(filter) {
			expressions.push(filter);
		}
		
		function getExpressions() {
			return expressions;
		}
		
		function getOperator() {
			return operator;
		}

		function setOperator(value) {
			operator = value
		}

		function getFilters() {
			
			var filters = [];
			
			for (var i=0,l=expressions.length; i<l; i++) {

				var exp = expressions[i];

				if (exp.getFilters) {
					filters = filters.concat(exp.getFilters());					
				}
				else {
					filters.push(exp);
				}
			}

			return filters;	
		}

		function createRequestParamForSimpleRestriction() {
			
			var filters = this.getFilters();

			var restriction = [];

			for (var i=0,l=filters.length; i<l; i++) {
				
				var filter = filters[i];

				if (filter.isDefined()) {
					restriction.push(filter.createRequestParam());
				}
			}

			return restriction;
		}

		function createRequestParamForComplexRestriction() {
			/* TODO */
			return {};			
		}
	}

	function Filter(options) {
		
		this.attribute;
		this.type;
		this.operator = options.operator || "EQUALS";
		this.value;
		this.sensitive = options.sensitive !== undefined ? options.sensitive : true;

		this.init = init;
		this.isDefined = isDefined;
		this.createRequestParam = createRequestParam;

		this.init(options);

		function init(options) {
			
			if (angular.isString(options)) {
				this.id = options;
				this.attribute = options;
			}
			else {
				if (options.id === undefined && options.attribute === undefined) {
					throw new Error("Filter - The options 'id' or 'attribute' should be set!, " + options.toString());
				}

				angular.merge(this, options);

				if (this.id === undefined) {
					this.id = this.attribute;
				}

				if (this.attribute === undefined) {
					this.attribute = this.id;
				}
			}
		}

		function isDefined() {
			
			var array = ['IS_NULL', 'IS_NOT_NULL', 'IS_EMPTY', 'IS_NOT_EMPTY'];

			return (this.value !== null && this.value !== undefined && this.value !== '') || AngularWidgets.inArray(array, this.operator);
		}

		function createRequestParam() {

			var param = {
				attribute: this.attribute,
				value: this.value,
				operator: this.operator,
				sensitive: this.sensitive
			};

			if (this.type) {
				param.type = this.type;
			}

			return param;
		}
	}

}(window, document));