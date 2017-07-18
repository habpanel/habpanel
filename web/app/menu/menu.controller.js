(function() {
'use strict';

    angular
        .module('app')
        .controller('MenuCtrl', MenuController)
        .controller('DashboardSettingsCtrl', DashboardSettingsCtrl);

    MenuController.$inject = ['$rootScope', '$scope', 'dashboards', '$routeParams', '$interval', '$location', 'PersistenceService', 'OHService', 'prompt', '$filter', '$uibModal', 'Fullscreen'];
    function MenuController($rootScope, $scope, dashboards, $routeParams, $interval, $location, PersistenceService, OHService, prompt, $filter, $modal, Fullscreen) {
        var vm = this;
        vm.dashboards = dashboards;
        vm.editMode = false;
        vm.clock = new Date();

        activate();

        ////////////////

        function activate() {
            var tick = function () {
                vm.clock = Date.now();
            }
            $interval(tick, 1000);
            if ($rootScope.settings.no_scrolling) iNoBounce.enable(); else iNoBounce.disable();
            if ($routeParams.kiosk) $rootScope.kioskMode = ($routeParams.kiosk == 'on');

            OHService.reloadItems();
        }

        if (!$rootScope.menucolumns)
            $rootScope.menucolumns = 1;

        vm.gridsterOptions = {
            margins: [5, 5],
            columns: $rootScope.menucolumns,
            defaultSizeX: 1,
            defaultSizeY: 1,
            rowHeight: 110,
            swapping: true,
            //floating: false,
            mobileModeEnabled: false,
            draggable: { enabled: true, handle: '.handle', stop: function(evt) { PersistenceService.saveDashboards() } },
            resizable: { enabled: false, stop: function(evt) { PersistenceService.saveDashboards() } }
        }

        vm.addNewDashboard = function() {
            prompt({
                title: "New dashboard",
                message: "Name of your new dashboard:",
                input: true
            }).then(function (name) {
                dashboards.push({ id: name, name: name, widgets: [] });
                PersistenceService.saveDashboards();
            });

        }

        vm.toggleEditMode = function () {
            vm.editMode = !vm.editMode;
            vm.gridsterOptions.resizable.enabled=vm.editMode;
            if (vm.editMode)
                iNoBounce.disable();
            else
                if ($rootScope.settings.no_scrolling) iNoBounce.enable();
        }

        vm.removeDashboard = function (dash) {
            prompt({
                title: "Remove dashboard",
                message: "Please confirm you want to delete this dashboard: " + dash.name,
            }).then(function () {
                dashboards.splice(dashboards.indexOf(dash), 1);
                PersistenceService.saveDashboards();
            });
        };

        vm.renameDashboard = function (dash) {
            prompt({
                title: "Rename dashboard",
                message: "New name:",
                value: dash.name,
                input: true
            }).then(function (name) {
                dash.id = dash.name = name;
                PersistenceService.saveDashboards();
            })

        };

        vm.onChangedColumns = function () {
            if ($rootScope.menucolumns !== vm.gridsterOptions.columns) {
                console.log('columns from ' + $rootScope.menucolumns + " to " + vm.gridsterOptions.columns);
                $rootScope.menucolumns = vm.gridsterOptions.columns;
                PersistenceService.saveDashboards();
            }
            angular.forEach(dashboards, function (dash) {
                if (dash.col > vm.gridsterOptions.columns - 1)
                    dash.col = vm.gridsterOptions.columns - 1;

                if (dash.col + dash.sizeX > vm.gridsterOptions.columns - 1)
                    dash.sizeX = vm.gridsterOptions.columns - dash.col;
            });
        };

        vm.viewDashboard = function (dash) {
            if (vm.editMode) {
                $location.url('/edit/' + dash.id);
            } else {
                $location.url('/view/' + dash.id);
            }
        }

		vm.goFullscreen = function () {
			Fullscreen.toggleAll();
		}


        vm.openDashboardSettings = function(dashboard) {
            $modal.open({
                scope: $scope,
                templateUrl: 'app/menu/menu.settings.tpl.html',
                controller: 'DashboardSettingsCtrl',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    dashboard: function() {
                        return dashboard;
                    }
                }
            }).result.then(function (dashboards) {
                var newdashboard = PersistenceService.getDashboard(dashboard.id);
                var idx = vm.dashboards.indexOf(dashboard);
                vm.dashboards[idx] = newdashboard; 
            });
        };

    }

    // settings dialog
    DashboardSettingsCtrl.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'dashboard', 'OHService', 'PersistenceService'];

    function DashboardSettingsCtrl($scope, $timeout, $rootScope, $modalInstance, dashboard, OHService, PersistenceService) {
        $scope.dashboard = dashboard;
        if (!$scope.dashboard.tile) $scope.dashboard.tile = {};
        //$scope.items = OHService.getItems();

        $scope.form = {
            name: dashboard.name,
            sizeX: dashboard.sizeX,
            sizeY: dashboard.sizeY,
            col: dashboard.col,
            row: dashboard.row,
            columns: dashboard.columns,
            row_height: dashboard.row_height,
            widget_margin: dashboard.widget_margin,
            font_scale: dashboard.font_scale,
            mobile_breakpoint: dashboard.mobile_breakpoint,
            mobile_mode_enabled: dashboard.mobile_mode_enabled,
            tile: {
                background_image: dashboard.tile.background_image,
                backdrop_iconset: dashboard.tile.backdrop_iconset,
                backdrop_icon: dashboard.tile.backdrop_icon,
                backdrop_center : dashboard.tile.backdrop_center,
                iconset: dashboard.tile.iconset,
                icon: dashboard.tile.icon,
                icon_size: dashboard.tile.icon_size,
                icon_nolinebreak: dashboard.tile.icon_nolinebreak,
                icon_replacestext: dashboard.tile.icon_replacestext
            }
        };

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.remove = function() {
            $rootScope.dashboards.splice($rootScope.dashboards.indexOf(dashboard), 1);
            PersistenceService.saveDashboards().then(function () {
                $modalInstance.dismiss();
            });
        };

        $scope.submit = function() {
            angular.extend(dashboard, $scope.form);
            PersistenceService.getDashboard(dashboard.id).tile = angular.copy(dashboard.tile);
            PersistenceService.saveDashboards().then(function () {
                $rootScope.dashboards = null;
                PersistenceService.getDashboards().then (function (dashboards) {
                    $modalInstance.close(dashboards);
                });
            });
        };

    }
    
})();