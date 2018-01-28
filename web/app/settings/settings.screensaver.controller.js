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
        'dashboards',
        '$location',
        'prompt'
    ];

    function ScreensaverSettingsCtrl(
        $rootScope,
        $scope,
        PersistenceService,
        TranslationService,
        ScreensaverService,
        dashboards,
        $location,
        prompt
    ) {

        $scope._form = {};
        $scope.dashboards = angular.copy(dashboards);
        $scope.config = angular.copy(ScreensaverService.config);
        $scope.save = () => {
            if (ScreensaverService.saveSettings($scope.config)) {
                $scope.updatedMessage = TranslationService.translate("settings.screensaver.update.success", "Screensaver settings updated.");
                $scope._form.$setPristine();
            }
            else
                $scope.updateErrorMessage = TranslationService.translate("settings.screensaver.update.fail", "Screensaver settings update failed.");
        }

        $scope.cancel = () => {
            if (!$scope._form.$pristine) {
                prompt({
                    title: TranslationService.translate("settings.screensaver.cancelconfirm.title", "Cancel Changes?"),
                    message: TranslationService.translate("settings.screensaver.cancelconfirm.message", "You have unsaved changes. Clicking OK will revert to previous settings.")
                }).then(() => { $location.url('/settings'); });
                return;
            }

            $location.url('/settings');
        }

        return ScreensaverSettingsCtrl;
    }
})();
