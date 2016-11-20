(function() {
    'use strict';

    angular.module('app', [
        'gridster',
        'ui.bootstrap',
        'ngRoute',
        'ngTouch',
        'app.services',
        'app.widgets',
        'cgPrompt',
        'LocalStorageModule',
        'FBAngular',
        'oc.lazyLoad',
        'angular-clipboard',
        'ngFileSaver',
        'snap'
    ])
    .config(['$routeProvider', 'localStorageServiceProvider', function($routeProvider, localStorageServiceProvider) {
        localStorageServiceProvider.setStorageType('localStorage');

        $routeProvider
            .when('/', {
                templateUrl: 'app/menu/menu.html',
                controller: 'MenuCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboards: ['PersistenceService', function (persistenceService) {
                        return persistenceService.getDashboards();
                    }]
                }
            })
            .when('/edit/:id', {
                templateUrl: 'app/dashboard/dashboard.edit.html',
                controller: 'DashboardEditCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboard: ['PersistenceService', '$q', '$route', function (persistenceService, $q, $route) {
                        var dashboard = persistenceService.getDashboard($route.current.params.id);
                        return (dashboard) || $q.defer().reject("Unknown dashboard");
                    }],
                    codemirror: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'vendor/cm/lib/codemirror.css',
                            'vendor/cm/lib/codemirror.js'
                        ]).then(function () {
                            return $ocLazyLoad.load([
                                'vendor/cm/addon/fold/xml-fold.js',
                                'vendor/cm/addon/edit/matchbrackets.js',
                                'vendor/cm/addon/edit/matchtags.js',
                                'vendor/cm/addon/edit/closebrackets.js',
                                'vendor/cm/addon/edit/closetag.js',
                                'vendor/cm/addon/mode/overlay.js',
                                'vendor/cm/mode/xml/xml.js'
                            ]);
                        });
                    }]
                }
            })
            .when('/view/:id', {
                templateUrl: 'app/dashboard/dashboard.view.html',
                controller: 'DashboardViewCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboard: ['PersistenceService', '$q', '$route', function (persistenceService, $q, $route) {
                        var dashboard = persistenceService.getDashboard($route.current.params.id);
                        return (dashboard) || $q.defer().reject("Unknown dashboard");
                    }]
                }
            })
            .when('/settings', {
                templateUrl: 'app/settings/settings.html',
                controller: 'SettingsCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboards: ['PersistenceService', function (persistenceService) {
                        return persistenceService.getDashboards();
                    }],
                    themes: ['$http', function ($http) {
                        return $http.get('assets/styles/themes/themes.json');
                    }]
                }
            })
            .when('/settings/localconfig', {
                templateUrl: 'app/settings/settings.localconfig.html',
                controller: 'SettingsLocalConfigCtrl',
                controllerAs: 'vm',
                resolve: {
                    dashboards: ['PersistenceService', function (persistenceService) {
                        return persistenceService.getDashboards();
                    }],
                    codemirror: ['$ocLazyLoad', '$timeout', function ($ocLazyLoad, $timeout) {
                        return $ocLazyLoad.load([
                            'vendor/cm/lib/codemirror.css',
                            'vendor/cm/lib/codemirror.js',
                            'vendor/cm/theme/rubyblue.css',
                        ]).then (function () {
                            return $ocLazyLoad.load([
                                'vendor/cm/addon/edit/matchbrackets.js',
                                'vendor/cm/addon/edit/closebrackets.js',
                                'vendor/cm/mode/javascript/javascript.js'
                            ]);
                        })
                    }]
                }
            })
            .when('/settings/widgets', {
                templateUrl: 'app/settings/settings.widgets.list.html',
                controller: 'WidgetListCtrl',
                controllerAs: 'vm',
                resolve: {
                    widgets: ['PersistenceService', function (persistenceService) {
                        return persistenceService.getCustomWidgets();
                    }]
                }
            })
            .when('/settings/widgets/design/:id', {
                templateUrl: 'app/settings/settings.widgets.designer.html',
                controller: 'WidgetDesignerCtrl',
                controllerAs: 'vm',
                resolve: {
                    widget: ['PersistenceService', '$route', function (persistenceService, $route) {
                        return persistenceService.getCustomWidget($route.current.params.id);
                    }],
                    codemirror: ['$ocLazyLoad', '$timeout', function ($ocLazyLoad, $timeout) {
                        return $ocLazyLoad.load([
                            'vendor/cm/lib/codemirror.css',
                            'vendor/cm/lib/codemirror.js',
                            'vendor/cm/theme/rubyblue.css',
                        ]).then (function () {
                            return $ocLazyLoad.load([
                                'vendor/cm/addon/edit/matchbrackets.js',
                                'vendor/cm/addon/edit/matchtags.js',
                                'vendor/cm/addon/edit/closebrackets.js',
                                'vendor/cm/addon/edit/closetag.js',
                                'vendor/cm/addon/mode/overlay.js',
                                'vendor/cm/mode/xml/xml.js'
                            ]);
                        })
                    }]
                }
            })
            .otherwise({
                redirectTo: '/'
            });

    }])
})();