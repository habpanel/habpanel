(function() {
    'use strict';

    angular.module('app.widgets', [
        'app.services',
        'rzModule',
        'ui.knob',
        'web.colorpicker',
        'n3-line-chart',
        'sprintf',
        'ui.codemirror',
        'ds.clock'
    ])
    .value('WidgetTypes', [])
    .factory('Widgets', WidgetsService)
    .directive('genericWidget', GenericWidgetDirective)
    .directive('widgetIcon', WidgetIcon)
    .directive('itemPicker', ItemPicker)
    

    WidgetsService.$inject = ['WidgetTypes'];
    function WidgetsService(widgetTypes) {

        var service = {
            registerType: registerType,
            getWidgetTypes: getWidgetTypes
        }

        return service;

        ////////////////
        
        function registerType(widget) {
            widgetTypes.push(widget);
            console.log("Registered widget type: " + widget.type);
        }

        function getWidgetTypes() {
            return widgetTypes;
        }

    }

    GenericWidgetDirective.$inject = ['$compile', 'Widgets'];
    function GenericWidgetDirective($compile, widgets) {
        var directive = {
            restrict: 'AE',
            replace: true,
            scope: {
                type   : '=',
                ngModel: '='
            },
            link: function (scope, element, attrs) {
                element.html('<widget-' + scope.type + ' ng-model="ngModel"></widget-' + scope.type + '>');
                $compile(element.contents())(scope);
            }
        }

        return directive;
    }

    WidgetIcon.$inject = ['IconService'];

    function WidgetIcon(IconService) {
        var directive = {
            link: link,
            restrict: 'AE',
            template: 
                '<div class="icon" ng-class="{backdrop: backdrop, center: center, inline: inline}">' +
                '<img ng-if="backdrop" height="100%" ng-class="{ colorize: colorize }" class="icon-tile-backdrop" ng-src="{{iconUrl}}" />' +
                '<img ng-if="!backdrop" ng-style="{ width: size + \'px\' }" ng-class="{ colorize: colorize, off: state==\'OFF\' }" class="icon-tile" ng-src="{{iconUrl}}" />' +
                '</div>',
            scope: {
                iconset : '=',
                icon    : '=',
                backdrop: '=?',
                center  : '=?',
                inline  : '=?',
                size    : '=?',
                state   : '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            if (!scope.size) scope.size = 32;
            scope.colorize = IconService.getIconSet(scope.iconset).colorize;
            scope.iconUrl = IconService.getIconUrl(scope.iconset, scope.icon);

            scope.$watch('state', function (state) {
                scope.iconUrl = IconService.getIconUrl(
                    scope.iconset,
                    scope.icon,
                    (state) ? state.toString() : null
                );
            });
        }
    }

    ItemPicker.$inject = ['$filter', 'OHService'];

    function ItemPicker($filter, OHService) {
        var directive = {
            bindToController: true,
            link: link,
            controller: ItemPickerController,
            controllerAs: 'vm',
            restrict: 'AE',
            template:
                '<ui-select ng-model="vm.selectedItem">' +
                '  <ui-select-match>{{$select.selected.name}}</ui-select-match>' +
                '  <ui-select-choices repeat="item in vm.itemlist | filter: $select.search">' +
                '    <div ng-bind-html="item.name | highlight: $select.search"></div>' +
                '    <small ng-bind-html="item.label | highlight: $select.search"></small>' +
                '  </ui-select-choices>' +
                '</ui-select>',
            scope: {
                ngModel: '=',
                filterType: '@'
            }
        };
        return directive;

        function link(scope, element, attrs) {
        }
    }
    ItemPickerController.$inject = ['$scope', '$filter', 'OHService'];
    function ItemPickerController ($scope, $filter, OHService) {
        var vm = this;
        vm.selectedItem = OHService.getItem(this.ngModel);
        vm.itemlist = OHService.getItems();
        if (this.filterType) {
            vm.itemlist = $filter('filter')(vm.itemlist, function (item) {
                return item.type.startsWith(vm.filterType)
            });
        }

        $scope.$watch("vm.selectedItem", function (newitem, oldvalue) {
            if (newitem && newitem.name)
                $scope.vm.ngModel = newitem.name;
        });
        
    }



})();
