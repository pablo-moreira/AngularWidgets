/**
 */
'use strict';

/**
 * The main angularWidgets demo app module.
 *
 * @type {angular.Module}
 */
var demo = angular.module('demo', ['ngRoute', 'angularWidgets']);

demo.config(['$routeProvider', 'widgets', function($routeProvider, widgets) {
   
    AngularWidgets.configure({
    	httpDataSource : {
			httpMethod : 'get'
        }
    });

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

    angular.element(window).bind('load', function() {

        var btn = angular.element(document.querySelector('#nav-toggle')),
            nav = angular.element(document.querySelector('#nav-container')),
            navOverlay = angular.element(document.querySelector("#nav-overlay")),
            body = angular.element(window.document.body),
            header = angular.element(document.querySelector('#header'));

        var onBodyClick = function(e) {
                
            if (AngularWidgets.isVisible(nav[0])) {
                
                var clickOnNav = AngularWidgets.isRelative(event.target, nav[0]);
                var clickOnNavToggle = AngularWidgets.isRelative(event.target, btn[0]);

                if (!clickOnNavToggle && !clickOnNav || (clickOnNav && event.target !== nav[0])) {
                    hide();
                }
            }
        };

        btn.click(function (e) {
            
            if (AngularWidgets.isVisible(nav[0])) {
                hide();    
            }
            else {
                show();    
            }            
        });

        function hide() {  
            header.css('zIndex', 50);
            nav.hide();
            navOverlay.hide();
            body.removeClass('pui-modal-open');
            body.unbind('click', onBodyClick);
        }

        function show() {
            header.css('zIndex', AngularWidgets.zindex + 3);
            nav.css('zIndex', AngularWidgets.zindex + 2);
            navOverlay.css('zIndex', AngularWidgets.zindex + 1);
            nav.show();
            navOverlay.show();
            body.addClass('pui-modal-open');
            body.bind('click', onBodyClick);
        }
    });
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

