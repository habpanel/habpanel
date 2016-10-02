angular.module('app')
    .controller('DashboardEditCtrl', ['$scope', '$location', '$timeout', 'prompt', 'dashboard', 'sitemappage', 'Widgets', 'PersistenceService', 'OHService', 'SitemapTranslationService',
        function($scope, $location, $timeout, prompt, dashboard, sitemappage, Widgets, PersistenceService, OHService, SitemapTranslationService) {

            $scope.dashboard = dashboard;
            if (sitemappage) {
                $scope.page = sitemappage.data;
                $scope.widgets = [];
                if (!$scope.dashboard.pagelayouts) $scope.dashboard.pagelayouts = {};
                var pagelayout = $scope.dashboard.pagelayouts[$scope.page.id];
                SitemapTranslationService.buildWidgetsFromSitemapPage($scope.widgets, $scope.page.widgets, pagelayout);
            } else {
                if (!$scope.dashboard.widgets) $scope.dashboard.widgets = [];
                $scope.widgets = $scope.dashboard.widgets;
                $scope.widgetTypes = Widgets.getWidgetTypes();
            }

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


            $scope.clear = function() {
                $scope.widgets = [];
            };

            $scope.addWidget = function(type) {
                $scope.widgets.push({
                    name: "New Widget",
                    sizeX: 4,
                    sizeY: 4,
                    item: null,
                    type: type
                });
            };

            $scope.save = function() {
                if ($scope.page) {
                    SitemapTranslationService.savePageLayoutToDashboard($scope.widgets, $scope.page, $scope.dashboard);
                }

                PersistenceService.saveDashboards().then(function () {

                }, function (err) {
                    $scope.error = err;
                });
            };

            $scope.run = function() {
                if ($scope.page) {
                    SitemapTranslationService.savePageLayoutToDashboard($scope.widgets, $scope.page, $scope.dashboard);
                }

                PersistenceService.saveDashboards().then(function () {
                    if ($scope.page) {
                        $location.url("/sitemap/view/" + $scope.dashboard.id + '/' + $scope.page.id);
                    } else {
                        $location.url("/view/" + $scope.dashboard.id);
                    }
                }, function (err) {
                    $scope.error = err;
                });
                
            };

            $scope.resetPageLayout = function() {
                prompt({
                    title: "Reset page Layout",
                    message: "Please confirm you want to reset all widget layout customizations for this sitemap page: " + $scope.page.title,
                }).then(function () {
                    $scope.dashboard.pagelayouts[$scope.page.id] = {};
                    PersistenceService.saveDashboards().then(function () {
                        $scope.widgets = [];
                        SitemapTranslationService.buildWidgetsFromSitemapPage($scope.widgets, $scope.page.widgets, {});

                    }, function (err) {
                        $scope.error = err;
                    });
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
