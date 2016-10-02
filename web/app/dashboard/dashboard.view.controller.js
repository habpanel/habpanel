angular
        .module('app')
        .controller('DashboardViewCtrl', DashboardViewController);

DashboardViewController.$inject = ['$scope', '$location', '$rootScope', '$timeout', 'dashboard', 'sitemappage', 'PersistenceService', 'OHService', 'SitemapTranslationService', 'Fullscreen'];
function DashboardViewController($scope, $location, $rootScope, $timeout, dashboard, sitemappage, PersistenceService, OHService, SitemapTranslationService, Fullscreen) {
    var vm = this;
    vm.dashboard = dashboard;
    if (sitemappage) {
        vm.page = sitemappage.data;
        vm.title = sitemappage.data.title;
    } else {
        vm.title = vm.dashboard.name;
    }

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
        vm.widgets = [];
        if (vm.dashboard.sitemap) {
            var pagelayout = {};
            if (vm.dashboard.pagelayouts && vm.dashboard.pagelayouts[vm.page.id])
                pagelayout = vm.dashboard.pagelayouts[vm.page.id];

            SitemapTranslationService.buildWidgetsFromSitemapPage(vm.widgets, vm.page.widgets, pagelayout);
        } else {
            vm.widgets = vm.dashboard.widgets;
        }


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
        if (vm.page) {
            $location.url("/sitemap/edit/" + vm.dashboard.id + '/' + vm.page.id);
        } else {
            $location.url("/edit/" + vm.dashboard.id);
        }
    };

    vm.goToPage = function (pageid) {
        $location.url('/sitemap/view/' + vm.dashboard.id + '/' + pageid);
    };
}
