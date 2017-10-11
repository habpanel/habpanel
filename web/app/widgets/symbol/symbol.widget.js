(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('widgetSymbol', widgetSymbol)
        .controller('WidgetSettingsCtrl-symbol', WidgetSettingsCtrlSymbol)
        .config(function (WidgetsProvider) { 
            WidgetsProvider.$get().registerType({
                type: 'symbol',
                displayName: 'Symbol',
                icon: 'sort-by-attributes',
                description: 'A symbol visualizing a state or value'
            });
        });

    widgetSymbol.$inject = ['$rootScope', '$uibModal', 'Widgets', 'OHService'];
    function widgetSymbol($rootScope, $modal, Widgets, OHService) {
        // Usage: <widget-symbol ng-model="widget" />
        //
        // Creates: A Symbol widget
        //
        var directive = {
            bindToController: true,
            controller: SymbolController,
            controllerAs: 'vm',
            link: link,
            restrict: 'AE',
            templateUrl: 'app/widgets/symbol/symbol.tpl.html',
            scope: {
                ngModel: '='
            }
        };
        return directive;
        
        function link(scope, element, attrs) {
            element[0].parentElement.parentElement.className; // += " activefeedback";
        }
    }

    SymbolController.$inject = ['$rootScope', '$scope', '$location', 'OHService'];
    function SymbolController ($rootScope, $scope, $location, OHService) {
        var vm = this;
        this.widget = this.ngModel;
        
        function update() {
            // check each rule
            for (var i = 0; i < vm.widget.rules.length; ++i) {
                if (checkConditions(vm.widget.rules[i].conditions)) {
                    vm.currentStyle = vm.widget.rules[i].style;
                    return;
                }
            }
        }

        function checkConditions(conditions) {
            for (var i = 0; i < conditions.length; ++i) {
                // if one of the conditions does not match, 
                // exit and continue with next rule
                if (!checkCondition(conditions[i]))
                    return false;
            }

            // all conditions matched (or none configured)
            return true;
        }

        function checkCondition(condition) {
            
            var operand = "";
            // get operand
            if (condition.operand == "item-state") {
                operand = OHService.getItem(vm.widget.item).state;

            } else if (condition.operand == "current-time") {
                var d = new Date();
                operand = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
                    
            } else if (condition.operand == "current-date") {
                var d = new Date();
                operand = (d.getFullYear().toString() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2));
                
            } else {
                console.warn("Operand '" + condition.operand + "' is not supported.");
                return false;
            }

            // compare using operator
            if (condition.operator == "equal-to") {
                return operand == condition.value;

            } else if (condition.operator == "not-equal-to") {
                return operand != condition.value;

            } else if (condition.operator == "less-than") {
                return operand < condition.value;

            } else if (condition.operator == "greater-than") {
                return operand > condition.value;

            } else if (condition.operator == "less-than-or-equal-to") {
                return operand <= condition.value;

            } else if (condition.operator == "greater-than-or-equal-to") {
                return operand >= condition.value;
                
            } else if (condition.operator == "matches") {
                return new RegExp(condition.value).test(operand);

            } else if (condition.operator == "does-not-match") {
                return !(new RegExp(condition.value).test(operand));

            }

            console.warn("Operator '" + condition.operator + "' is not supported.")
            return false;
        }

        OHService.onUpdate($scope, vm.widget.item, function () {
            update();
        });

        this.timer = setInterval(update, 1000);
    }

    // settings dialog
    WidgetSettingsCtrlSymbol.$inject = ['$scope', '$timeout', '$rootScope', '$uibModalInstance', 'widget', 'OHService'];
    
    function WidgetSettingsCtrlSymbol($scope, $timeout, $rootScope, $modalInstance, widget, OHService) {
        $scope.widget = widget;
        $scope.items = OHService.getItems();

        // define available operands
        $scope.operands = [{
            code: "item-state",
            name: "Item state"
        }, {
            code: "current-time",
            name: "Current time"
        }, {
            code: "current-date",
            name: "Current date"
        }];

        // define available operators
        $scope.operators = [{
            code: "equal-to",
            name: "equal to"
        }, {
            code: "not-equal-to",
            name: "not equal to"
        }, {
            code: "less-than",
            name: "less than"
        }, {
            code: "greater-than",
            name: "greater than"
        }, {
            code: "less-than",
            name: "less than"
        }, {
            code: "less-than-or-equal-to",
            name: "less than"
        }, {
            code: "greater-than-or-equal-to",
            name: "greater than or equal to"
        }, {
            code: "matches",
            name: "matches"
        }, {
            code: "does-not-match",
            name: "does not match"        
        }];

        // define available rotations
        $scope.rotations = [{
            code: "symbol-rotation-none", 
            name: "None"
        }, {
            code: "symbol-rotation-45",
            name: "45°" 
        }, {
            code: "symbol-rotation-90",
            name: "90°" 
        }, {
            code: "symbol-rotation-135",
            name: "135°" 
        }, {
            code: "symbol-rotation-180",
            name: "180°" 
        }, {
            code: "symbol-rotation-225",
            name: "225°" 
        }, {
            code: "symbol-rotation-270",
            name: "270°" 
        }, {
            code: "symbol-rotation-315",
            name: "315°" 
        }];

        // define available animations
        $scope.animations = [{
            code: "symbol-animation-none", 
            name: "None"
        }, {
            code: "symbol-animation-spin symbol-animation-duration-0-5s",
            name: "Spin right 0.5s" 
        }, {
            code: "symbol-animation-spin symbol-animation-duration-1-0s",
            name: "Spin right 1.0s" 
        }, {
            code: "symbol-animation-spin symbol-animation-duration-1-5s",
            name: "Spin right 1.5s" 
        }, {
            code: "symbol-animation-spin symbol-animation-duration-2-0s",
            name: "Spin right 2.0s" 
        }, {
            code: "symbol-animation-spin-ccw symbol-animation-duration-0-5s",
            name: "Spin left 0.5s" 
        }, {
            code: "symbol-animation-spin-ccw symbol-animation-duration-1-0s",
            name: "Spin left 1.0s" 
        }, {
            code: "symbol-animation-spin-ccw symbol-animation-duration-1-5s",
            name: "Spin left 1.5s" 
        }, {
            code: "symbol-animation-spin-ccw symbol-animation-duration-2-0s",
            name: "Spin left 2.0s" 
        }, {
            code: "symbol-animation-flash symbol-animation-duration-0-5s",
            name: "Flash 0.5s" 
        }, {
            code: "symbol-animation-flash symbol-animation-duration-1-0s",
            name: "Flash 1.0s" 
        }, {
            code: "symbol-animation-flash symbol-animation-duration-1-5s",
            name: "Flash 1.5s" 
        }, {
            code: "symbol-animation-flash symbol-animation-duration-2-0s",
            name: "Flash 2.0s" 
        }, {
            code: "symbol-animation-blink symbol-animation-duration-0-5s",
            name: "Blink 0.5s" 
        }, {
            code: "symbol-animation-blink symbol-animation-duration-1-0s",
            name: "Blink 1.0s" 
        }, {
            code: "symbol-animation-blink symbol-animation-duration-1-5s",
            name: "Blink 1.5s" 
        }, {
            code: "symbol-animation-blink symbol-animation-duration-2-0s",
            name: "Blink 2.0s" 
        }];

        $scope.form = {
            name: widget.name,
            sizeX: widget.sizeX,
            sizeY: widget.sizeY,
            col: widget.col,
            row: widget.row,
            item: widget.item,
            rules: widget.rules || []
        };
 
        function move(array, index, delta) {
            var newIndex = index + delta;

            if (newIndex < 0  || newIndex == array.length) {
                 // already at the top or bottom.
                return;
            }
            // sort the indixes
            var indexes = [index, newIndex].sort();
            // replace from lowest index, two elements, reverting the order
            array.splice(indexes[0], 2, array[indexes[1]], array[indexes[0]]);
        };

        $scope.addRule = function() {
            $scope.form.rules.push({
                conditions: [],
                style: {
                    icon: "",
                    iconSet: "",
                    iconSize: 0,
                    iconAnimation: "symbol-animation-none",
                    iconRotation: "symbol-rotation-none",
                    background: "transparent",
                    backgroundAnimation: "symbol-animation-none"
                }
            });
        };

        $scope.removeRule = function(ruleIndex) {
            $scope.form.rules.splice(ruleIndex, 1);
        };

        $scope.moveRuleUp = function(ruleIndex) {
            move($scope.form.rules, ruleIndex, -1);
        };

        $scope.moveRuleDown = function(ruleIndex) {
            move($scope.form.rules, ruleIndex, 1);
        };

        $scope.addCondition = function(ruleIndex) {
            $scope.form.rules[ruleIndex].conditions.push({
                operand: 'item-state',
                operator: 'equal-to',
                value: ''
            });
        };

        $scope.removeCondition = function(ruleIndex, conditionIndex) {
            $scope.form.rules[ruleIndex].conditions.splice(conditionIndex, 1);
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
            if (!!widget.displayInput) delete widget.displayInput;
            if (!!widget.displayPrevious) delete widget.displayPrevious;

            $modalInstance.close(widget);
        };
    }

})();
