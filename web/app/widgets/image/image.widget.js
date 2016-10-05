(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetImage', widgetImage)
        .controller('WidgetSettingsCtrl-image', WidgetSettingsCtrlImage)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'image',
                displayName: 'Image',
                description: 'Displays an image (not necessarily from openHAB)'
            });
        });

    widgetImage.$inject = ['$rootScope', '$uibModal', 'OHService'];
    function widgetImage($rootScope, $modal, OHService) {
        // Usage: <widget-image ng-model="widget" />
        //
        // Creates: A image widget
        //
        var directive = {
            bindToController: true,
            controller: ImageController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/image/image.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
        }
    }
    ImageController.$inject = ['$rootScope', '$scope', 'OHService'];
    function ImageController ($rootScope, $scope, OHService) {
        var vm = this;
        this.widget = this.ngModel;

    }


    // settings dialog
    WidgetSettingsCtrlImage.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlImage($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            url: widget.url,
            iconset: widget.iconset,
            icon: widget.icon
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