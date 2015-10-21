/**
 */
'use strict';

/**
 * The main angularWidgets demo app module.
 *
 * @type {angular.Module}
 */
var demo = angular.module('demo', ['ngRoute', 'pje.ui']);

demo.config(['$routeProvider', 'widgets', 'puiGrowlConfig', function($routeProvider, widgets, puiGrowlConfig) {

    // Configure highlightjs
    hljs.configure({
      tabReplace: '    ', // 4 spaces
    })

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

demo.directive('demoSource', function () {
    return {
        restrict: 'E',
        priority: 10000,
        terminal: true,
        compile: function (element, attrs) {
        	
        	var content = element.html(),
                encoded = content
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/_[a-z]/g, function(s) {return s.charAt(1).toUpperCase()});
            
            element.html('');

            var div = angular.element('<div class="demo-source"><pre><code class="' + attrs.language  + '">' + encoded + '</code></pre></div>')
                .appendTo(element);
            
            var code = div.findAllSelector('code');
        	
            hljs.highlightBlock(code[0]);
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