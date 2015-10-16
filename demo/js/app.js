/**
 */
'use strict';

/**
 * The main angularWidgets demo app module.
 *
 * @type {angular.Module}
 */
var demo = angular.module('demo', ['ngRoute', 'pje.ui']);

demo.config(['$routeProvider', 'widgets', function($routeProvider, widgets) {

    angular.forEach(widgets, function(widget) {
    	angular.forEach(widget.subPages, function (widgetPage) {

            var alias = widget.controller.firstToLowerCase().replace('Controller', 'Ctrl')
            
            $routeProvider.when('/' + widgetPage.path, {
                templateUrl: 'partials/' + widgetPage.path + '.html',
                controller: widget.controller,
                controllerAs: alias
            });    		
    	});
    });
	
    $routeProvider.when('/main', {
        templateUrl: 'partials/main.html',
        controller: 'MainController'
    });
    
    $routeProvider.when('/license', {
        templateUrl: 'partials/license.html',
        controller: 'MainController'
    });

    $routeProvider.when('/planned', {
        templateUrl: 'partials/planned.html',
        controller: 'MainController'
    });
    
    $routeProvider.otherwise({ redirectTo: '/main' });
}]);

demo.directive('prettyPrint', function () {
    return {
        restrict: 'A',
        priority: 1001,
        terminal: true,
        compile: function (element, attrs) {
        	element.removeAttr('pretty-print');
            var content = element.html();
            var encoded = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/_[a-z]/g, function(s) {return s.charAt(1).toUpperCase()});
            element.html(prettyPrintOne(encoded, attrs.prettyPrint));
        }
    }
});

demo.directive('version', function () {
    return {
        restrict: 'A',
        compile: function (element, attrs) {
            element.html('<img src="demo/'+attrs.version+'.png" style="margin-left:10px"/>');
        }
    }
});