  angular
        .module('app')
        .controller('DashboardViewCtrl', DashboardViewController);

  DashboardViewController.$inject = ['$scope', '$location', '$rootScope', '$timeout', 'dashboard', 'PersistenceService', 'OHService', 'Fullscreen'];
  function DashboardViewController($scope, $location, $rootScope, $timeout, dashboard, PersistenceService, OHService, Fullscreen) {
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
        iNoBounce.enable();
      //Fullscreen.all();
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
