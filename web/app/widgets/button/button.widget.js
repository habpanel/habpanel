(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetButton', widgetButton)
        .controller('WidgetSettingsCtrl-button', WidgetSettingsCtrlButton)
        .config(function (WidgetsProvider) {
            WidgetsProvider.$get().registerType({
                type: 'button',
                displayName: 'Button',
                icon: 'download-alt',
                description: 'A button sending a specific value to an openHAB item'
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
            element[0].parentElement.parentElement.className += " activefeedback";
        }
    }
    ButtonController.$inject = ['$rootScope', '$scope', '$location', 'OHService', '$window'];
    function ButtonController($rootScope, $scope, $location, OHService, $window) {
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

        function onNavigate() {
            if (!vm.widget.navigate_url)
                return;

            if (vm.widget.navigate_type === 'dashboard') {
                $location.url('/view/' + vm.widget.navigate_url);
                return;
            }

            switch (vm.widget.navigate_target || 'self') {
                case 'new_tab':
                    var w = $window.open(vm.widget.navigate_url);
                    w && (w.opener = null);
                    break;

                case 'new_window':
                    var w = $window.open(vm.widget.navigate_url, "_blank", "resizable=1", true);
                    w && (w.opener = null);
                    break;

                default:
                case 'self': {
                    $window.location.href = vm.widget.navigate_url;
                    break;
                }
            }

        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

        vm.sendCommand = function () {
            switch (vm.widget.action_type) {
                case "navigate":
                    onNavigate();
                    break;

                case "toggle":
                    if (vm.widget.command && vm.widget.command_alt) {
                        if (vm.value === vm.widget.command) {
                            OHService.sendCmd(this.widget.item, this.widget.command_alt);
                        } else {
                            OHService.sendCmd(this.widget.item, this.widget.command);
                        }
                    }
                    break;
                default:
                    OHService.sendCmd(this.widget.item, this.widget.command);
                    break;
            }
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
            action_type: widget.action_type || 'command',
            command: widget.command,
            command_alt: widget.command_alt,
            background: widget.background,
            foreground: widget.foreground,
            font_size: widget.font_size,
            background_active: widget.background_active,
            foreground_active: widget.foreground_active,
            backdrop_iconset: widget.backdrop_iconset,
            backdrop_icon: widget.backdrop_icon,
            backdrop_center: widget.backdrop_center,
            iconset: widget.iconset,
            icon: widget.icon,
            icon_size: widget.icon_size,
            icon_nolinebreak: widget.icon_nolinebreak,
            icon_replacestext: widget.icon_replacestext,
            show_item_value: widget.show_item_value || false,
            navigate_type: widget.navigate_type || 'dashboard',
            navigate_url: widget.navigate_url,
            navigate_target: widget.navigate_target || 'self'
        };

        $scope.dismiss = function () {
            $modalInstance.dismiss();
        };

        $scope.remove = function () {
            $scope.dashboard.widgets.splice($scope.dashboard.widgets.indexOf(widget), 1);
            $modalInstance.close();
        };

        $scope.submit = function () {
            angular.extend(widget, $scope.form);
            switch (widget.action_type) {
                case "navigate":
                    delete widget.command;
                    delete widget.command_alt;
                    break;
                case "toggle":
                    delete widget.navigate_url;
                    delete widget.navigate_type;
                    delete widget.navigate_target;
                    break;
                default:
                    delete widget.command_alt;
                    delete widget.navigate_url;
                    delete widget.navigate_type;
                    delete widget.navigate_target;
                    delete widget.action_type;
                    break;
            }

            $modalInstance.close(widget);
        };

    }


})();
