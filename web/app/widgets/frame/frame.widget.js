(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetFrame', widgetFrame)
        .controller('WidgetSettingsCtrl-frame', WidgetSettingsCtrlFrame)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'frame',
                displayName: 'Frame',
                icon: 'globe',
                description: 'Embedded website from predefined URL or openHAB item.'
            });
        });

    widgetFrame.$inject = ['$rootScope', '$uibModal', 'OHService', '$sce'];
    function widgetFrame($rootScope, $modal, OHService, $sce) {
        // Usage: <widget-label ng-model="widget" />
        //
        // Creates: A label widget
        //
        var directive = {
            bindToController: true,
            controller: FrameController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/frame/frame.tpl.html',
            scope: {
                ngModel: '='
            }
        };

        return directive;
        
        function link(scope, element, attrs) {
        }
    }

    FrameController.$inject = ['$rootScope', '$scope', 'OHService', '$sce'];
    function FrameController ($rootScope, $scope, OHService, $sce) {
        var vm = this;
        this.widget = this.ngModel;

        function updateValue() {
            var item = OHService.getItem(vm.widget.item);
            if (!item || vm.widget.url_source !== 'item') {
                vm.value = "";
                return;
            }
            $scope.detailFrame = $sce.trustAsResourceUrl(item.state);
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            updateValue();
        });

        if (this.widget.url_source === 'static') {
            $scope.detailFrame = $sce.trustAsResourceUrl(this.widget.frameUrl);
        }
    };


    // settings dialog
    WidgetSettingsCtrlFrame.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService', '$sce'];

    function WidgetSettingsCtrlFrame($scope, $timeout, $rootScope, $modalInstance, widget, OHService, $sce) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name      : widget.name,
            sizeX     : widget.sizeX,
            sizeY     : widget.sizeY,
            col       : widget.col,
            row       : widget.row,
            url_source: widget.url_source || 'static',
            item      : widget.item,
            frameUrl  : widget.frameUrl,
            frameless : widget.frameless,
            hidelabel : widget.hidelabel,
            background: widget.background
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
            switch (widget.url_source) {
                case "item":
                    delete widget.frameUrl;
                    break;
                default:
                    delete widget.item;
                    delete widget.action_type;
                    break;
            }

            $modalInstance.close(widget);
        };
    }
})();