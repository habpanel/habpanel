(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetTemplate', widgetTemplate)
        .controller('WidgetSettingsCtrl-template', WidgetSettingsCtrlTemplate)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'template',
                displayName: 'Template',
                description: 'A template widget - displays a custom dynamic template'
            });
        });

    widgetTemplate.$inject = ['$rootScope', '$compile', '$filter', 'OHService'];
    function widgetTemplate($rootScope, $compile, $filter, OHService) {
        // Usage: <widget-template ng-model="widget" />
        //
        // Creates: A template widget
        //
        var directive = {
            //bindToController: true,
            //controller: TemplateWidgetController,
            //controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            var template = scope.ngModel.template;
            if (scope.ngModel.dontwrap) {
                if (scope.ngModel.nobackground) {
                    template = "<div class=\"template-nobkg\">" + template + "</div>";
                }
            } else {
                template = "<div class=\"box-content template-container" +
                    ((scope.ngModel.nobackground) ? " template-nobkg" : "") +
                    "\"><div class=\"template-contents\">" +
                             template + "</div></div>";
            }

            element.html(template);

            $compile(element.contents())(scope);

            scope.itemValue = function(item) {
                var item = OHService.getItem(item);
                if (!item) {
                    return "N/A";
                }

                var value = item.state;
                return value;
            }

            scope.itemsInGroup = function(group) {
                return $filter('filter')(OHService.getItems(),
                    function (item) {
                        return (item.groupNames && item.groupNames.indexOf(group) !== -1);
                    }
                );
            }

            scope.itemsWithTag = function(tag) {
                return $filter('filter')(OHService.getItems(),
                    function (item) {
                        return (item.tagNames && item.tagNames.indexOf(tag) !== -1);
                    }
                );
            }

            scope.sendCmd = function(item, cmd) {
                var item = OHService.getItem(item);
                if (!item) {
                    return;
                }

                OHService.sendCmd(item.name, cmd);
            }            
        }
    }
    TemplateWidgetController.$inject = ['$rootScope', '$scope', '$filter', 'OHService'];
    function TemplateWidgetController ($rootScope, $scope, $filter, OHService) {
        var vm = this;
        this.widget = this.ngModel;
        this.items = OHService.getItems();

    }


    // settings dialog
    WidgetSettingsCtrlTemplate.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];

    function WidgetSettingsCtrlTemplate($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        $scope.editorOptions = {
            lineNumbers: true,
            matchTags: {bothTags: true},
            autoCloseTags: true,
            matchBrackets: true,
            mode: 'xml',
        };

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            template: widget.template,
            dontwrap: widget.dontwrap,
            nobackground: widget.nobackground
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

        $timeout(function () {
            $scope.refreshEditor = new Date();
        });

    }


})();
