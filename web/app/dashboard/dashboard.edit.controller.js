angular.module('app')
    .controller('DashboardEditCtrl', ['$scope', '$location', '$timeout', 'dashboard', 'Widgets', 'PersistenceService', 'OHService',
        function($scope, $location, $timeout, dashboard, Widgets, PersistenceService, OHService) {

            $scope.dashboard = dashboard;

            $scope.gridsterOptions = {
                margins: [5, 5],
                columns: 12,
                pushing: false,
                floating: false,
                mobileModeEnabled: false,
                draggable: {
                    handle: '.box-header'
                },
                resizable: {
                    enabled: true,
                    handles: ['se']
                }
            };

            $scope.widgetTypes = Widgets.getWidgetTypes();

            $scope.clear = function() {
                $scope.dashboard.widgets = [];
            };

            $scope.addWidget = function(type) {
                $scope.dashboard.widgets.push({
                    name: "New Widget",
                    sizeX: 4,
                    sizeY: 4,
                    item: null,
                    type: type
                });
            };

            $scope.save = function() {
                PersistenceService.saveDashboards().then(function () {

                }, function (err) {
                    $scope.error = err;
                });
            };

            $scope.run = function() {
                PersistenceService.saveDashboards().then(function () {
                    $location.url("/view/" + $scope.dashboard.id);
                }, function (err) {
                    $scope.error = err;
                });
                
            };

            OHService.reloadItems();

        }
    ])

    .controller('CustomWidgetCtrl', ['$scope', '$uibModal', 'OHService',
        function($scope, $modal, OHService) {

            $scope.remove = function(widget) {
                $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            };

            $scope.openSettings = function(widget) {
                $modal.open({
                    scope: $scope,
                    templateUrl: 'app/widgets/' + widget.type + '/' + widget.type + '.settings.tpl.html',
                    controller: 'WidgetSettingsCtrl-' + widget.type,
                    resolve: {
                        widget: function() {
                            return widget;
                        }
                    }
                });
            };

        }
    ])

    .controller('WidgetSettingsCtrl', ['$scope', '$timeout', '$rootScope', '$modalInstance', 'widget', 'OHService',
        function($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
            $scope.widget = widget;
            $scope.items = OHService.getItems();

            $scope.form = {
                name: widget.name,
                sizeX: widget.sizeX,
                sizeY: widget.sizeY,
                col: widget.col,
                row: widget.row,
                item: widget.item
            };

            $scope.dismiss = function() {
                $modalInstance.dismiss();
            };

            $scope.remove = function() {
                $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
                $modalInstance.close();
            };

            $scope.submit = function() {
                angular.extend(widget, $scope.form);

                $modalInstance.close(widget);
            };

        }
    ])

    // helper code
    .filter('object2Array', function() {
        return function(input) {
            var out = [];
            for (i in input) {
                out.push(input[i]);
            }
            return out;
        }
    });
