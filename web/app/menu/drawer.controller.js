(function() {
'use strict';

    angular
        .module('app')
        .controller('DrawerController', DrawerController);

    DrawerController.$inject = ['$scope', '$rootScope', '$timeout', '$filter', '$location', 'OHService', 'PersistenceService', 'tmhDynamicLocaleCache', 'snapRemote'];
    function DrawerController($scope, $rootScope, $timeout, $filter, $location, OHService, PersistenceService, tmhDynamicLocaleCache, snapRemote) {
        $scope.goHome = function () {
            $location.url('/');
        }

        $scope.goToSettings = function () {
            $location.url('/settings');
        }

        $scope.goToDashboard = function (name) {
            $location.url('/view/' + name);
        }

        $scope.isActive = function (name) {
            if (name === "/" || name === "/settings") {
                return $location.url() === name;
            }

            return ($location.url() === '/view/' + encodeURI(name) || $location.url() === '/edit/' + encodeURI(name));
        }

        $scope.isShown = function (dash) {
            return (!dash.drawer || !dash.drawer.hide);
        }

        activate();

        $scope.$on("refreshMenu", function (evt) {
            refreshMenu();
        });

        ////////////////

        function activate() {
            refreshMenu();
        }

        function refreshMenu() {
            if ($rootScope.dashboards) {
                $scope.dashlist = $filter('orderBy')($rootScope.dashboards, ['row', 'col']).map(function (dash) {
                    return { id: dash.id, name: dash.name };
                });
            };

            snapRemote.getSnapper().then(function (snapper) {
                var drawer = angular.element(window.document).find("aside")[0];
                drawer.style.display = '';
                if ($rootScope.kioskMode)
                    snapper.disable();
            });
        }

        $scope.dateFormat = 'EEEE d MMMM';
        OHService.getLocale().then(function (locale) {
            $scope.$on('$localeChangeSuccess', function () {
                var nglocale = tmhDynamicLocaleCache.get(locale.toLowerCase());
                if (nglocale) {
                    $scope.dateFormat = nglocale.DATETIME_FORMATS.fullDate.replace(/('de'\s|\u060c\s|,\s)?y\.?(\s'\u0433'|(\s'\u0440'))?\.?/g, '').trim();
                }
            });
        });
    }
})();