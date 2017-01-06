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
                    scope.vm.height = sprintf("%d", height - 91);
                } else if (scope.vm.widget.charttype === 'default') {
                    scope.vm.width = sprintf("%d", width - 20);
                    scope.vm.height = sprintf("%d", height - 20);
                }
            });
        }
    }
    ChartController.$inject = ['$rootScope', '$scope', '$http', '$q', '$filter', 'OHService'];
    function ChartController ($rootScope, $scope, $http, $q, $filter, OHService) {
        var vm = this;
        this.widget = this.ngModel;

        function formatValue(itemname, val) {
            var item = OHService.getItem(itemname);
                
            if (item && item.stateDescription && item.stateDescription.pattern)
                return sprintf(item.stateDescription.pattern, val);
            else
                return val;
        }

        function tooltipHook(values) {
            if (values)
                return {
                    abscissas: $filter('date')(values[0].row.x, 'EEE d MMM HH:mm:ss'),
                    rows: values.map(function(val) {
                        return {
                            label: val.series.label,
                            value: formatValue(val.series.id, val.row.y0 || val.row.y1),
                            color: val.series.color,
                            id: val.series.id
                        }
                    })
                };
        };

        if (vm.widget.charttype == 'interactive') {
            var startTime = function() {
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
                    case 'M': startDate.setTime(startDate.getTime() - 31*24*60*60*1000); break; //Well...
                    case '2M': startDate.setTime(startDate.getTime() - 2*31*24*60*60*1000); break;
                    case '4M': startDate.setTime(startDate.getTime() - 4*31*24*60*60*1000); break;
                    case 'Y': startDate.setTime(startDate.getTime() - 12*31*24*60*60*1000); break;
                    default: startDate.setTime(startDate.getTime() - 24*60*60*1000); break;
                }
                return startDate;
            }
            var startDate = startTime();

            if (!vm.widget.series || !vm.widget.series.length)
                return;

            vm.rawdata = [];
            for (var i = 0; i < vm.widget.series.length; i++) {
                vm.rawdata[i] = $http.get('/rest/persistence/items/' + vm.widget.series[i].item + '?serviceId=' + vm.widget.service + "&starttime=" + startDate.toISOString());
            }

            $q.all(vm.rawdata).then(function (values) {
                vm.datasets = {};
                for (var i = 0; i < values.length; i++) {
                    var seriesname = values[i].data.name;
                    var finaldata = values[i].data.data;

                    angular.forEach(finaldata, function (datapoint) {
                        datapoint.time = new Date(datapoint.time);
                        datapoint.state = parseFloat(datapoint.state);
                    });

                    vm.datasets[seriesname] = finaldata;
                }

                vm.interactiveChartOptions = {
                    margin: {
                        top: 20,
                        bottom: 50
                    },
                    series: [],
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
                        },
                        y: { padding: { min: 0, max: 8 } },
                        y2: { padding: { min: 0, max: 8 } }
                    },
                    tooltipHook: tooltipHook,
                    zoom: {
                        x: true
                    },
                    liveUpdates: {
                        enabled: false
                    }
                };

                if (vm.widget.axis.y.min)
                    vm.interactiveChartOptions.axes.y.min = vm.widget.axis.y.min;
                if (vm.widget.axis.y.max)
                    vm.interactiveChartOptions.axes.y.max = vm.widget.axis.y.max;
                if (vm.widget.axis.y.includezero)
                    vm.interactiveChartOptions.axes.y.includeZero = vm.widget.axis.y.includezero;
                if (vm.widget.axis.y.ticks)
                    vm.interactiveChartOptions.axes.y.ticks = vm.widget.axis.y.ticks;
                if (vm.widget.axis.y2 && vm.widget.axis.y2.enabled) {
                    if (vm.widget.axis.y2.min)
                        vm.interactiveChartOptions.axes.y2.min = vm.widget.axis.y2.min;
                    if (vm.widget.axis.y2.max)
                        vm.interactiveChartOptions.axes.y2.max = vm.widget.axis.y2.max;
                    if (vm.widget.axis.y2.includezero)
                        vm.interactiveChartOptions.axes.y2.includeZero = vm.widget.axis.y2.includezero;
                    if (vm.widget.axis.y2.ticks)
                        vm.interactiveChartOptions.axes.y2.ticks = vm.widget.axis.y2.ticks;
                }

                for (var i = 0; i < vm.widget.series.length; i++) {
                    var seriesoptions = {
                        axis: vm.widget.series[i].axis,
                        dataset: vm.widget.series[i].item,
                        key: "state",
                        label: vm.widget.series[i].name || vm.widget.series[i].item,
                        color: (vm.widget.series[i].color && vm.widget.series[i].color !== "transparent") ?
                                    vm.widget.series[i].color : '#0db9f0',
                        type: [],
                        id: vm.widget.series[i].item
                    };
                    if (vm.widget.series[i].display_line) seriesoptions.type.push("line");
                    if (vm.widget.series[i].display_area) seriesoptions.type.push("area");
                    if (vm.widget.series[i].display_dots) seriesoptions.type.push("dot");

                    vm.interactiveChartOptions.series.push(seriesoptions);
                }

                if(vm.widget.liveUpdates && vm.widget.liveUpdates.enabled){
                    vm.interactiveChartOptions.liveUpdates.enabled = true;
                    vm.interactiveChartOptions.liveUpdates.fillValues = vm.widget.liveUpdates.fillValues;
                }

                var updateValue = function(item) {
                    var dataset = vm.datasets[item.name];
                    if(dataset) {
                        var receivedUpdate = {
                            state: parseFloat(item.state),
                            time: new Date()
                        };
                        var startDate = startTime();
                        angular.forEach(vm.datasets, function(ds) {
                            // push last value of other datasets to get nicer looking graphs 
                            if(vm.interactiveChartOptions.liveUpdates.fillValues && dataset !== ds) {
                                ds.push({
                                    state: ds[ds.length-1].state,
                                    time: new Date()
                                });
                            }

                            // remove old values
                            for(var i = 0; i < ds.length; i++) {
                                if(ds[i].time > startDate) {
                                    ds.splice(0, i);
                                    break;
                                }
                            }
                        });

                        // add the received update
                        dataset.push(receivedUpdate);
                    }
                }

                if(vm.interactiveChartOptions.liveUpdates.enabled) {
                    OHService.onUpdate($scope, vm.widget.item, function (value, item) {
                        if(item) {
                            updateValue(item);
                        }
                    });
                }

            });
        }


        vm.imageQueryString = function(val) {
            var ret = "";
            if (vm.widget.isgroup)
                ret = "groups=" + vm.widget.item;
            else
                ret = "items=" + vm.widget.item;

            return ret + "&period=" + vm.widget.period;
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
            refresh: widget.refresh,
            axis: widget.axis || {y: {}, y2: {} },
            series: widget.series || [],
            liveUpdates: widget.liveUpdates || {}
        };
        if (!$scope.form.axis.y2)
            $scope.form.axis.y2 = { enabled: false };
        
        $scope.accordions = [];

        $scope.dismiss = function() {
            $modalInstance.dismiss();
        };

        $scope.addSeries = function () {
            $scope.form.series.push({ axis: 'y', display_line: true, display_area: true });
            $scope.accordions[$scope.form.series.length - 1] = true;
        };

        $scope.removeSeries = function (series) {
            $scope.form.series.splice($scope.form.series.indexOf(series), 1);
        }

        $scope.remove = function() {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function() {
            angular.extend(widget, $scope.form);
            if (widget.charttype !== "interactive") {
                delete widget.axis;
                delete widget.series;
                var item = OHService.getItem(widget.item);
                widget.isgroup = (item && (item.type === "Group" || item.type === "GroupItem"));
            } else {
                if (!widget.axis.y2.enabled)
                    delete widget.axis.y2;
            }

            $modalInstance.close(widget);
        };

    }


})();
