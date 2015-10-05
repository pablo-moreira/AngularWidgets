angular.module('demo.services', [])
//    .factory('Widgets', [ '$location', 'ConfigurationProvider', '$window','$rootScope', function ($location, ConfigurationProvider, $window, $rootScope) {
//        var widgets = {
//            allWidgets: []
//            , widgetSubPages : []
//            , selectWidget: function (widgetName) {
//                var defaultPage = this.defaultPage[widgetName];
//                this.widgetSubPages = this.subPages[widgetName];
//
//                $rootScope.safeApply(function () {
//                    $location.path(defaultPage);
//                });
//
//            }
//            , selectSubPage : function (path) {
//                $location.path(path);
//            }
//            , subPages : {}
//            , defaultPage : {}
//        };
//
//        angular.forEach(Configuration.getWidgetData(), function (info, key) {
//            widgets.allWidgets.push({label: info.widget});
//            widgets.defaultPage[info.widget] = info.defaultPath;
//
//            var widgetSubPages = [];
//            angular.forEach(info.subPages, function (subpage, key) {
//                this.push(subpage);
//            }, widgetSubPages);
//
//            widgets.subPages[info.widget] = widgetSubPages;
//        });
//
//
//        return widgets;
//    } ])
