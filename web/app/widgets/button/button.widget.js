(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetButton', widgetButton)
        .controller('WidgetSettingsCtrl-button', WidgetSettingsCtrlButton)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'button',
                displayName: 'Button',
                description: 'A button sending a specific value to an OpenHAB item'
            });
        });

    widgetButton.$inject = ['$rootScope', '$uibModal', 'Widgets', 'OHService'];
    function widgetButton($rootScope, $modal, Widgets, OHService) {
        // Usage: <widget-Button ng-model="widget" />
        //
        // Creates: A Button widget
        //
        var directive = {
            bindToController: true,
            controller: ButtonController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/button/button.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    ButtonController.$inject = ['$rootScope', '$scope', 'OHService'];
    function ButtonController ($rootScope, $scope, OHService) {
        var vm = this;
        this.widget = this.ngModel;
        
        vm.background = this.widget.background;
        vm.foreground = this.widget.foreground;
        vm.font_size = this.widget.font_size;

        function updateValue() {
            vm.value = OHService.getItem(vm.widget.item).state;
            if (vm.value === vm.widget.command) {
                vm.background = vm.widget.background_active;
                vm.foreground = vm.widget.foreground_active;
            } else {
                vm.background = vm.widget.background;
                vm.foreground = vm.widget.foreground;
            }
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

        vm.sendCommand = function () {
            OHService.sendCmd(this.widget.item, this.widget.command);
        }

    }


    // settings dialog
    WidgetSettingsCtrlButton.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlButton($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            command: widget.command,
            background: widget.background,
            foreground: widget.foreground,
            font_size: widget.font_size,
            background_active: widget.background_active,
            foreground_active: widget.foreground_active,
            backdrop_iconset: widget.backdrop_iconset,
            backdrop_icon: widget.backdrop_icon,
            backdrop_center : widget.backdrop_center,
            iconset: widget.iconset,
            icon: widget.icon,
            icon_size: widget.icon_size,
            icon_nolinebreak: widget.icon_nolinebreak,
            icon_replacestext: widget.icon_replacestext
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
