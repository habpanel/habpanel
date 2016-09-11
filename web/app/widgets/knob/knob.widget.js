(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetKnob', widgetKnob)
        .controller('WidgetSettingsCtrl-knob', WidgetSettingsCtrlKnob)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'knob',
                displayName: 'Knob',
                description: 'A knob for setting numerical OpenHAB items'
            });
        });

    widgetKnob.$inject = ['$rootScope', '$timeout', '$uibModal', 'OHService'];
    function widgetKnob($rootScope, $timeout, $modal, OHService) {
        // Usage: <widget-knob ng-model="widget" />
        //
        // Creates: A knob widget
        //
        var directive = {
            bindToController: true,
            controller: KnobController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/knob/knob.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            $timeout(function () {
                var width = element[0].parentNode.parentNode.parentNode.style.width.replace('px', '');
                scope.vm.knob.options.size = width - 20;
                if (!scope.vm.widget.trackWidth)
                    scope.vm.knob.options.trackWidth = width / 5;
                if (!scope.vm.widget.barWidth)
                    scope.vm.knob.options.barWidth = width / 5;
            });
        }
    }
    KnobController.$inject = ['$rootScope', '$scope', 'OHService', '$timeout'];
    function KnobController ($rootScope, $scope, OHService, $timeout) {
        var vm = this;
        this.widget = this.ngModel;

        function getValue() {
            var item = OHService.getItem(vm.widget.item);
            if (!item) {
                //console.log('item ' + vm.widget.item + ' not found');
                return;
            }

            var parts = item.state.split(',');
            var value;
            if (parts.length == 3) {
                // knob received HSB value, use the 3rd (brightness)
                value = parseInt(parts[2]);
            } else {
                value = parseInt(parts[0]);
            }

            return value;
        }

        vm.knob = {
            options: {
                id: 'knob-' + vm.widget.item,
                animate: { enabled: false, duration: 500, ease: 'circle' },
                min: (vm.widget.floor) ? vm.widget.floor : 0,
                max: (vm.widget.ceil) ? vm.widget.ceil : 100,
                step: (vm.widget.step) ? vm.widget.step : 1,
                unit: (vm.widget.unit) ? vm.widget.unit : '',
                size: (vm.widget.size) ? vm.widget.size : 300,
                startAngle: (vm.widget.startAngle) ? vm.widget.startAngle : 0,
                endAngle: (vm.widget.endAngle) ? vm.widget.endAngle : 360,
                displayInput: (vm.widget.displayInput) ? vm.widget.displayInput : true,
                readOnly: (vm.widget.readOnly) ? vm.widget.readOnly : false,
                barWidth: (vm.widget.barWidth) ? vm.widget.barWidth : 50,
                trackWidth: (vm.widget.trackWidth) ? vm.widget.trackWidth : undefined,
                barColor: (vm.widget.barColor) ? vm.widget.barColor : '#0db9f0',
                prevBarColor: (vm.widget.prevBarColor) ? vm.widget.prevBarColor: '#789',
                trackColor: (vm.widget.trackColor) ? vm.widget.trackColor : '#567',
                textColor: (vm.widget.textColor) ? vm.widget.textColor : '#0db9f0',
                barCap: (vm.widget.barCap) ? vm.widget.barCap : 0,
                trackCap: (vm.widget.trackCap) ? vm.widget.trackCap : 0,
                fontSize: (vm.widget.fontSize) ? vm.widget.fontSize : 'auto',
                subText: { enabled: vm.widget.subTextEnabled, text: vm.widget.name, color: '#def', font:'auto' },
                bgColor: (vm.widget.bgColor) ? vm.widget.bgColor : '',
                scale: {
                    enabled: vm.widget.scaleEnabled,
                    type: vm.widget.scaleType,
                    color: (vm.widget.scaleColor) ? vm.widget.scaleColor : '#567',
                    width: (vm.widget.scaleWidth) ? vm.widget.scaleWidth : 2,
                },
                displayPrevious: (vm.widget.displayPrevious) ? vm.widget.displayPrevious : true,
                skin: {
                    type: (vm.widget.skinType) ? vm.widget.skinType : 'simple',
                    width: (vm.widget.skinWidth) ? vm.widget.skinWidth : 10,
                    color: (vm.widget.skinColor) ? vm.widget.skinColor : '#abc',
                    spaceWidth: (vm.widget.skinSpaceWidth) ? vm.widget.skinSpaceWidth : 5
                },
                dynamicOptions: true,
                onEnd: function (val) {
                    if (vm.value !== val) {
                        vm.value = val;
                        OHService.sendCmd(vm.widget.item, vm.value.toString());
                    }
                }
            }
        };

        var initialValue = getValue();
        vm.value = vm.knob.value = angular.isDefined(getValue()) ? getValue() : 0;

        function updateValue() {
            var value = getValue();

            if (!isNaN(value) && value != vm.knob.value) {
                vm.value = vm.knob.value = value;
            }

            //vm.knob.options.animate.enabled = false;

        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

    }


    // settings dialog
    WidgetSettingsCtrlKnob.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlKnob($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            floor: widget.floor || 0,
            ceil: widget.ceil || 100,
            step: widget.step || 1,
            unit: widget.unit,
            size: widget.size,
            startAngle: widget.startAngle,
            endAngle: widget.endAngle,
            displayInput: widget.displayInput,
            readOnly: widget.readOnly,
            barWidth: widget.barWidth,
            trackWidth: widget.trackWidth,
            barColor: widget.barColor,
            prevBarColor: widget.prevBarColor,
            trackColor: widget.trackColor,
            textColor: widget.textColor,
            barCap: widget.barCap,
            trackCap: widget.trackCap,
            fontSize: widget.fontSize,
            subTextEnabled: widget.subTextEnabled,
            scaleEnabled: widget.scaleEnabled,
            scaleType: widget.scaleType,
            scaleColor: widget.scaleColor,
            scaleWidth: widget.scaleWidth,
            displayPrevious: widget.displayPrevious,
            skinType: widget.skinType,
            skinWidth: widget.skinWidth,
            skinColor: widget.skinColor,
            skinSpaceWidth: widget.skinSpaceWidth
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
