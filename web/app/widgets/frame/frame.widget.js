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
                description: 'A fixed label used for headers etc. (no openHAB item binding)'
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
        $scope.detailFrame = $sce.trustAsResourceUrl(this.widget.frameUrl);
       
    };


    // settings dialog
    WidgetSettingsCtrlFrame.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService', '$sce'];

    function WidgetSettingsCtrlFrame($scope, $timeout, $rootScope, $modalInstance, widget, OHService, $sce) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            frameUrl: widget.frameUrl,
            frameless: widget.frameless,
            hidelabel: widget.hidelabel,
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

            $modalInstance.close(widget);
        };

    }


})();