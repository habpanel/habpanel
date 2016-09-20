(function() {
    'use strict';

    angular.module('app', [
        'gridster',
        'ui.bootstrap',
        'ngRoute',
        'app.services',
        'app.widgets',
        'cgPrompt',
        'LocalStorageModule',
        'FBAngular',
        'oc.lazyLoad',
        'angular-clipboard'
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
                    dashboard: ['PersistenceService', '$route', function (persistenceService, $route) {
                        return persistenceService.getDashboard($route.current.params.id);
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
                    dashboard: ['PersistenceService', '$route', function (persistenceService, $route) {
                        return persistenceService.getDashboard($route.current.params.id);
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
            .otherwise({
                redirectTo: '/'
            });



    }])
})();