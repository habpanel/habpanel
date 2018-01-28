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
        'prompt',
        '$route'
    ];

    function ScreensaverSettingsCtrl(
        $rootScope,
        $scope,
        PersistenceService,
        TranslationService,
        ScreensaverService,
        dashboards,
        $location,
        prompt,
        $route
    ) {

        $scope._form = { mainForm: {} };
        $scope.dashboards = angular.copy(dashboards);
        $scope.config = angular.copy(ScreensaverService.config);

        $scope.translations = {
            reorder: TranslationService.translate("screensaver.settings.common.reorder", "Reorder"),
            updateSuccess: TranslationService.translate("settings.screensaver.update.success", "Screensaver settings updated."),
            updateFail: TranslationService.translate("settings.screensaver.update.fail", "Screensaver settings update failed."),
            atleast2Db: TranslationService.translate("screensaver.settings.error.atleast2dashboard", "You need at least 2 configured dashboards in the rotation settings to enable slideshow."),
            cancelconfirmTitle: TranslationService.translate("settings.screensaver.cancelconfirm.title", "Cancel Changes?"),
            cancelconfirmMsg: TranslationService.translate("settings.screensaver.cancelconfirm.message", "You have unsaved changes. Clicking OK will revert to previous settings.")
        }

        let errorMessage = (m) => {
            $scope.errorMessage = m;
        }

        let infoMessage = (m) => {
            $scope.infoMessage = m;
        }

        let getErrors = () => {
            $scope._form.mainForm.$setValidity('dashboards', $scope.config.onStart.dashboards.length > 1);
            if ($scope._form.mainForm.$error['dashboards'])
                return $scope.translations.atleast2Db

            if (Object.keys($scope._form.mainForm.$error).length)
                return $scope.translations.updateFail;

            return null;
        }

        $scope.save = () => {
            let error = getErrors();
            if (error) {
                errorMessage(error);
                return;
            }

            if (ScreensaverService.saveSettings($scope.config)) {
                infoMessage($scope.translations.updateSuccess);
                $scope._form.mainForm.$setPristine();
            }
            else {
                errorMessage($scope.translations.updateFail);
            }

        }

        $scope.cancel = () => {
            if (!$scope._form.mainForm.$pristine) {
                prompt({
                    title: $scope.translations.cancelconfirmTitle,
                    message: $scope.translations.cancelconfirmMsg
                }).then(() => {
                    $route.reload();
                });
                return;
            }

            $location.url('/settings');
        }

        $scope.sortableOptions = {
            connectWith: ".db-sortable",
            update: () => {
                $scope._form.mainForm.$setDirty();
                let error = getErrors();
                if (error) {
                    errorMessage(error);
                }
            }
        }

        return ScreensaverSettingsCtrl;
    }
})();
