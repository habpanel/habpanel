(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetChart', widgetChart)
        .controller('WidgetSettingsCtrl-chart', WidgetSettingsCtrlChart)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'chart',
                displayName: 'Chart',
                description: 'Displays a chart'
            });
        });

    widgetChart.$inject = ['$rootScope', '$timeout', '$uibModal', 'OHService'];
    function widgetChart($rootScope, $timeout, $modal, OHService) {
        // Usage: <widget-chart ng-model="widget" />
        //
        // Creates: A chart widget
        //
        var directive = {
            bindToController: true,
            controller: ChartController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/chart/chart.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            $timeout(function () {
                var width = element[0].parentNode.parentNode.parentNode.style.width.replace('px', '');
                var height = element[0].parentNode.parentNode.parentNode.style.height.replace('px', '');
                if (scope.vm.widget.charttype === 'rrd4j') { // why?
                    scope.vm.width = sprintf("%d", width - 109);
                    scope.vm.height = sprintf("%d", height - 78);
                } else if (scope.vm.widget.charttype === 'default') {
                    scope.vm.width = sprintf("%d", width - 20);
                    scope.vm.height = sprintf("%d", height - 20);
                }
            });
        }
    }
    ChartController.$inject = ['$rootScope', '$scope', '$http', '$filter', 'OHService'];
    function ChartController ($rootScope, $scope, $http, $filter, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        function formatValue(val) {
            if (!vm.item)
                vm.item = OHService.getItem(vm.widget.item);
                
            if (vm.item && vm.item.stateDescription && vm.item.stateDescription.pattern)
                return sprintf(vm.item.stateDescription.pattern, val);
            else
                return val;
        }

        function tooltipHook(val) {
            if (val)
                return {
                    abscissas: $filter('date')(val[0].row.x, 'EEE d MMM HH:mm:ss'),
                    rows: [{
                        label: val[0].series.label,
                        value: formatValue(val[0].row.y0 || val[0].row.y1),
                        color: val[0].series.color,
                        id: val[0].series.id
                    }]
                };
        };

        if (vm.widget.charttype == 'interactive') {
            var startDate = new Date();
            switch (vm.widget.period)
            {
                case 'h': startDate.setTime(startDate.getTime() - 60*60*1000); break;
                case '4h': startDate.setTime(startDate.getTime() - 4*60*60*1000); break;
                case '8h': startDate.setTime(startDate.getTime() - 8*60*60*1000); break;
                case '12h': startDate.setTime(startDate.getTime() - 12*60*60*1000); break;
                case 'D': startDate.setTime(startDate.getTime() - 24*60*60*1000); break;
                case '3D': startDate.setTime(startDate.getTime() - 3*24*60*60*1000); break;
                case 'W': startDate.setTime(startDate.getTime() - 7*24*60*60*1000); break;
                case '2W': startDate.setTime(startDate.getTime() - 2*7*24*60*60*1000); break;
                case '1M': startDate.setTime(startDate.getTime() - 31*24*60*60*1000); break; //Well...
                case '2M': startDate.setTime(startDate.getTime() - 2*31*24*60*60*1000); break;
                case '4M': startDate.setTime(startDate.getTime() - 4*31*24*60*60*1000); break;
                case 'Y': startDate.setTime(startDate.getTime() - 12*31*24*60*60*1000); break;
                default: startDate.setTime(startDate.getTime() - 24*60*60*1000); break;
            }

            $http.get('/rest/persistence/items/' + vm.widget.item + '?serviceId=' + vm.widget.service + "&starttime=" + startDate.toISOString()).then(function (resp) {
                console.log('datapoints=' + resp.data.datapoints);
                if (resp.data.datapoints < 1) return;

                var seriesname = resp.data.name;
                var finaldata = resp.data.data;

                angular.forEach(finaldata, function (datapoint) {
                    datapoint.time = new Date(datapoint.time);
                    datapoint.state = parseFloat(datapoint.state);
                });

                vm.datasets = {};
                vm.datasets[seriesname] = finaldata;

                vm.interactiveChartOptions = {
                    margin: {
                        top: 20,
                        bottom: 50
                    },
                    series: [
                        {
                            axis: "y",
                            dataset: seriesname,
                            key: "state",
                            label: vm.widget.name,
                            color: "#0db9f0",
                            type: [
                            "line", "area"
                            ],
                            id: seriesname
                        }
                    ],
                    axes: {
                        x: {
                            key: "time",
                            type: "date",
                            tickFormat: function (value) {
                                if (value.getDate() === 1) {
                                    return $filter('date')(value, 'MMM');
                                }
                                if (value.getHours() === 0) {
                                    return $filter('date')(value, 'EEE d');
                                }
                                return $filter('date')(value, 'HH:mm');
                            }
                        }
                    },
                    tooltipHook: tooltipHook,
                    zoom: {
                        x: true
                    }
                    // grid: {
                    //     x: true
                    // }
                };

            });
        }
    }


    // settings dialog
    WidgetSettingsCtrlChart.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlChart($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            charttype: widget.charttype,
            service: widget.service,
            period: widget.period,
            refresh: widget.refresh
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


})();
