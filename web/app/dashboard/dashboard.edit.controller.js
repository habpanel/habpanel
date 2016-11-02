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


            $scope.loadScript = function(url, type, charset) {
                if (type===undefined) type = 'text/javascript';
                if (url) {
                    var script = document.querySelector("script[src*='"+url+"']");
                    if (!script) {
                        var heads = document.getElementsByTagName("head");
                        if (heads && heads.length) {
                            var head = heads[0];
                            if (head) {
                                script = document.createElement('script');
                                script.setAttribute('src', url);
                                script.setAttribute('type', type);
                                if (charset) script.setAttribute('charset', charset);
                                head.appendChild(script);
                            }
                        }
                    }
                    return script;
                }
            };

            $scope.loadCss = function(url) {
                if (url) {
                    var script = document.querySelector("link[href*='"+url+"']");
                    if (!script) {
                        var heads = document.getElementsByTagName("head");
                        if (heads && heads.length) {
                            var head = heads[0];
                            if (head) {
                                script = document.createElement('link');
                                script.setAttribute('rel', 'stylesheet');
                                script.setAttribute('href', url);
                                head.appendChild(script);
                                setTimeout(200);
                            }
                        }
                    }
                    return script;
                }
            };

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
            iNoBounce.disable();
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
                    backdrop: 'static',
                    size: (widget.type == 'template') ? 'lg' : '',
                    resolve: {
                        widget: function() {
                            return widget;
                        }
                    }
                });
            };

            $scope.transferWidget = function(widget) {
                $modal.open({
                    scope: $scope,
                    templateUrl: 'app/dashboard/transferwidget.html',
                    controller: 'TransferWidgetCtrl',
                    backdrop: 'static',
                    resolve: {
                        widget: function() {
                            return widget;
                        }
                     }
                })
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


    // transfer (copy/move) dialog
    .controller('TransferWidgetCtrl', ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget',
        function ($scope, $timeout, $rootScope, $modalInstance, widget) {

            $scope.widgetName = widget.name;
            $scope.selDashboards = [];

            // build array with dashboard ids/names and pass to form
            $rootScope.dashboards.forEach( function(arrayItem) {
                $scope.selDashboards.push({id: arrayItem.id, name: arrayItem.name});
            });

            // make current dashboard default target
            $scope.form = {
                targetDashboard: $scope.dashboard.id,
                currentDashboard: $scope.dashboard.id
            };

            $scope.dismiss = function() {
                $modalInstance.dismiss();
            };


            $scope.copyWidget = function(par) {

                // copy widget and reset row and column to get placed automatically
                var copiedWidget = angular.copy(widget);
                delete copiedWidget.col;
                delete copiedWidget.row;
                // get index of target dashboard first and then copy
                var index = $rootScope.dashboards.findIndex( function(element) {return element.id == $scope.form.targetDashboard; });
                $rootScope.dashboards[index].widgets.push(copiedWidget);

                if (par.close) {
                    $modalInstance.close(widget);
                }
            };

            $scope.moveWidget = function() {
                $scope.copyWidget({close: false});

                // remove source widget from current dashboard
                this.remove(widget);

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




