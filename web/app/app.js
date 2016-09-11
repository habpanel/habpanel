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
        'FBAngular'
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
            .otherwise({
                redirectTo: '/'
            });

    }])
})();