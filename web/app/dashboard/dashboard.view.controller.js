  angular
        .module('app')
        .controller('DashboardViewCtrl', DashboardViewController);

  DashboardViewController.$inject = ['$scope', '$location', '$rootScope', '$routeParams', '$timeout', 'dashboard', 'PersistenceService', 'OHService', 'Fullscreen', 'snapRemote'];
  function DashboardViewController($scope, $location, $rootScope, $routeParams, $timeout, dashboard, PersistenceService, OHService, Fullscreen, snapRemote) {
    var vm = this;
    vm.dashboard = dashboard;

    vm.gridsterOptions = {
        margins: [5, 5],
        columns: 12,
        pushing: false,
        floating: false,
        mobileModeEnabled: false,
        draggable: { enabled: false },
        resizable: { enabled: false }
    };

    var fullscreenhandler = Fullscreen.$on('FBFullscreen.change', function(evt, enabled) {
        vm.fullscreen = enabled;
    });

    $scope.$on('$destroy', function() {
        fullscreenhandler();
        //OHService.clearAllLongPollings();
    });

    OHService.onUpdate($scope, '', function () {
        vm.ready = true;
        // for sliders
        $timeout(function () {
            $scope.$broadcast('rzSliderForceRender');
        });
    });

    activate();

    ////////////////

    function activate() {
        $timeout(function() {
            OHService.reloadItems();
        });
        if ($rootScope.settings.no_scrolling) iNoBounce.enable(); else iNoBounce.disable();
        if ($routeParams.kiosk) $rootScope.kioskMode = ($routeParams.kiosk == 'on');
        if ($rootScope.kioskMode) {
            snapRemote.getSnapper().then(function (snapper) {
                snapper.disable();
            })
        }
    }

    vm.refresh = function() {
        OHService.reloadItems();
    };

    vm.goFullscreen = function() {
        Fullscreen.toggleAll();
    };

    vm.toggleEdit = function() {
        $location.url("/edit/" + dashboard.id);
    };
  }
