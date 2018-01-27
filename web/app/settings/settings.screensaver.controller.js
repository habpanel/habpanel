(function () {
    'use strict';

    angular
        .module('app')
        .controller('ScreensaverSettingsCtrl', ScreensaverSettingsCtrl);

    ScreensaverSettingsCtrl.$inject = [
        '$rootScope', 
        '$scope', 
        'PersistenceService', 
        'TranslationService',
        'ScreensaverService',
        'dashboards'
    ];

    function ScreensaverSettingsCtrl(
        $rootScope,
        $scope,
        PersistenceService,
        TranslationService,
        ScreensaverService,
        dashboards
    ) {

        $scope.dashboards = angular.copy(dashboards);
        $scope.config = angular.copy(ScreensaverService.config);

        $scope.save = () => {
            
        }

        return ScreensaverSettingsCtrl;
    }
})();
