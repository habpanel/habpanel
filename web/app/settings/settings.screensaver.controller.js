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

        $scope._form = { mainForm: {} };
        $scope.dashboards = angular.copy(dashboards);
        $scope.config = angular.copy(ScreensaverService.config);
        $scope.config.onStart.dashboardsExcluded = $scope.config.onStart.dashboardsExcluded || [];

        $scope.translations = {
            reorder: TranslationService.translate("screensaver.settings.common.reorder", "Reorder"),
            updateSuccess: TranslationService.translate("settings.screensaver.update.success", "Screensaver settings updated."),
            updateFail: TranslationService.translate("settings.screensaver.update.fail", "Screensaver settings update failed."),
            atleast2Db: TranslationService.translate("screensaver.settings.error.atleast2dashboard", "You need at least 2 configured dashboard to enable slideshow."),
            cancelconfirmTitle: TranslationService.translate("settings.screensaver.cancelconfirm.title", "Cancel Changes?"),
            cancelconfirmMsg: TranslationService.translate("settings.screensaver.cancelconfirm.message", "You have unsaved changes. Clicking OK will revert to previous settings.")
        }

        $scope.save = () => {
            if (ScreensaverService.saveSettings($scope.config)) {
                $scope.updatedMessage = $scope.translations.updateSuccess;
                $scope._form.mainForm.$setPristine();
            }
            else
                $scope.updateErrorMessage = $scope.translations.updateFail;
        }

        $scope.cancel = () => {
            if (!$scope._form.mainForm.$pristine) {
                prompt({
                    title: $scope.translations.cancelconfirmTitle,
                    message: $scope.translations.cancelconfirmMsg
                }).then(() => { $location.url('/settings'); });
                return;
            }

            $location.url('/settings');
        }

        $scope.sortableOptions = {
            placeholder: "sortable-placeholder",
            connectWith: ".db-sortable",
            update: () => {
                $scope._form.mainForm.$setDirty();
                $scope._form.mainForm.$setValidity('dashboards', $scope.config.onStart.dashboards.length > 0);
                $scope.updateErrorMessage = $scope.translations.atleast2Db
            }
        }

        return ScreensaverSettingsCtrl;
    }
})();
