(function(window, document, undefined) {
    "use strict";

	AngularWidgets.FunctionDataSource = function (fctLoader) {

		// public 
		this.load = load;
		this.getRowCount = getRowCount;
		this.getData = getData;			

		// private
		var data = [];
		var onLoadData = null;
		var deferred = AngularWidgets.$q.defer();

		function setData(d) {
			data = d;
		} 

		function load(request) {

			try {
				fctLoader(request, function(data) {

					setData(data);

					deferred.resolve(request);						
				});					
			}
			catch (e) {
				deferred.reject({ 'request': request, 'error': e });
			}

			return customPromise(deferred.promise);
		}    	

		function getRowCount() {
			return data.length;
		}

		function getData() {
			return data;
		}
	}

	AngularWidgets.ArrayDataSource = function (allData) {
      	
		// public
		this.load = load
		this.allData = allData;
		this.getRowCount = getRowCount;
		this.getData = getData;
		this.processRestrictions = processRestrictions;

		// private
		var data = [];
		var filteredData = allData;		

		function processRestrictions(query, queryExpression, expressions) {

			angular.forEach(expressions, function(expression) {

				if (expression.restrictions) {
					if (expression.operator === 'AND') {
						this.processRestrictions(queryExpression.addAnd(), expression.restrictions);
					}
					else {
						this.processRestrictions(queryExpression.addOr(), expression.restrictions);
					}
				}
				else {
					queryExpression.add(function(item) {

						var attributeValue = query.getAttributeValueByPath(item, expression.attribute);

						return AngularWidgets.DataFilter.check(attributeValue, expression.value, expression.operator, expression.sensitive);
					});
				}					
			})	
		}	

		function load(request) {

			var deferred = AngularWidgets.$q.defer();

			try {
				
				var query = new AngularWidgets.DataQuery(this.allData),
					queryExpression = null;
				
				if (request.restriction)  {
					
					var restrictions = null;

					// Simple restriction
					if (AngularWidgets.isArray(request.restriction)) {
						queryExpression = query.where('AND');
						restrictions = request.restriction;
					}
					else {
						queryExpression = query.where(request.restriction.operator === 'AND' ? 'AND' : 'OR');
						restrictions = request.restriction.restrictions;
					}

					this.processRestrictions(query, queryExpression, restrictions);
				}
				else if (request.query) {
					
					queryExpression = query.where('AND');
					
					queryExpression.add(function(item) {
						
						var attributeValue = (request.query.attribute === '*') ? item : query.getAttributeValueByPath(item, request.query.attribute);
						
						return AngularWidgets.DataFilter.check(attributeValue, request.query.value, 'START_WITH', true);
					});
				}

				if (request.sorts && request.sorts.length) {

					for (var i=0, l=request.sorts.length; i < l; i++)  {

						var sort = request.sorts[i];

						if (sort.order === 'ASC') {
							query.sort().asc(sort.attribute);
						}	
						else {
							query.sort().desc(sort.attribute);
						}
					}
				}

				filteredData = query.select();

				var rowCount = filteredData.length,
				rows = request.pageSize || filteredData.length,    		
				page = request.first + rows;
				
				data = [];
				
				for (var i = request.first; i < (page) && i < rowCount; i++) {
					data.push(filteredData[i]);
				}

				deferred.resolve(request);
			}
			catch (e) {
				deferred.reject({ 'request': request, 'error': e });
			}

			return customPromise(deferred.promise);
		}

		function getRowCount() {
			return filteredData.length;
		}

		function getData() {
			return data;
		}
	};

	AngularWidgets.configure({
		httpDataSource: {
			httpMethod : 'post',
			parseRequest: function(request) {
				return request;
			},
			parseResponse: function (data, request) {
				return data;
			}
		}
	});
		
	AngularWidgets.HttpDataSource = function (options) {

		// public
		this.url = options.url;
		this.method = options.method || AngularWidgets.getConfiguration().httpDataSource.httpMethod;
		this.load = load;
		this.parseRequest = options.parseRequest || AngularWidgets.getConfiguration().httpDataSource.parseRequest;
		this.parseResponse = options.parseResponse || AngularWidgets.getConfiguration().httpDataSource.parseResponse;
		this.getRowCount = getRowCount;
		this.getData = getData;

		// private
		var data = null;
		var loadedData = null;

		function load(request) {

			var $this = this;
			var deferred = AngularWidgets.$q.defer();

			AngularWidgets.$http[this.method](this.url, $this.parseRequest(request))
				.success(function(data) {

					loadedData = $this.parseResponse(data, request);

					deferred.resolve(request);
				})
				.error(function(data){
					deferred.reject({ 'request': request, 'error': data });
				});

			return customPromise(deferred.promise);
		};

		function getRowCount() {
			return loadedData.rowCount;
		}

		function getData() {
			return loadedData.rows;
		}
	};

	AngularWidgets.FakeHttpDataSource = function (options) {

		options.parseResponse = function(data, request) {

			var arrayDataSource = new AngularWidgets.ArrayDataSource(data.rows);

			arrayDataSource.load(request).error(function(response) {
				alert(response.error);
			});

			return { 
				'rowCount': arrayDataSource.getRowCount(), 
				'rows': arrayDataSource.getData() 
			};
		}

		return new AngularWidgets.HttpDataSource(options);
	}

	function customPromise(promise) {

		promise.success = function(fn) {

			promise.then(function(response) {
				fn(response);
			});

			return promise;
		};

		promise.error = function(fn) {

			return promise.then(null, function(response) {
				fn(response);
			});

			return promise;
		};

		return promise;			
	}

}(window, document));