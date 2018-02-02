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
        '$route',
        '$timeout'
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
        $route,
        $timeout
    ) {

        $scope._form = { mainForm: {} };
        $scope.dashboards = angular.copy(dashboards);
        $scope.config = angular.copy(ScreensaverService.config);
        $scope.errorMessages = [];
        $scope.infoMessages = [];
        $scope.translations = {
            reorder: TranslationService.translate("screensaver.settings.common.reorder", "Reorder"),
            updateSuccess: TranslationService.translate("screensaver.settings.update.success", "Screensaver settings updated."),
            updateFail: TranslationService.translate("screensaver.settings.update.fail", "Screensaver settings update failed."),
            atleast2Db: TranslationService.translate("screensaver.settings.error.atleast2dashboard", "You need at least 2 configured dashboards in the rotation settings to enable slideshow."),
            cancelconfirmTitle: TranslationService.translate("screensaver.settings.cancelconfirm.title", "Cancel Changes?"),
            cancelconfirmMsg: TranslationService.translate("screensaver.settings.cancelconfirm.message", "You have unsaved changes. Clicking OK will revert to previous settings."),
            tabheadingGeneral: TranslationService.translate("screensaver.settings.tabheading.general", "General"),
            tabheadingonstart: TranslationService.translate("screensaver.settings.tabheading.general", "On Start"),
            tabheadingonstop: TranslationService.translate("screensaver.settings.tabheading.general", "On Stop"),
            errorAtLeast1Sec: TranslationService.translate("screensaver.settings.error.errorAtLeast1Sec", "Interval must be at least 1 second."),
            idleTimeouterror: TranslationService.translate("screensaver.settings.error.errorAtLeast10Secs", "Timeout must be at least 10 seconds."),
        }

        var errorMap = {
            atleast2Db: $scope.translations.atleast2Db,
            dashboardTimeout: $scope.translations.errorAtLeast1Sec,
            idleTimeout: $scope.translations.idleTimeouterror,
        }

        var addErrorMessage = function (m) { $scope.errorMessages.indexOf(m) === -1 && $scope.errorMessages.push(m); }
        var addInfoMessage = function (m) { $scope.infoMessages.indexOf(m) === -1 && $scope.infoMessages.push(m); }
        $scope.clearErrorMessage = function (idx) { $scope.errorMessages.splice(idx, 1); }
        $scope.clearInfoMessage = function (idx) { $scope.infoMessages.splice(idx, 1); }

        var checkErrors = function () {
            $scope.config.onStart.type == 'slideshow'
                && $scope._form.mainForm.dashboards.$setValidity('atleast2Db', $scope.config.onStart.dashboards.length > 1);
                
            angular.forEach($scope._form.mainForm.$error, function (v, k) {
                var isAdded = errorMap[k] && (addErrorMessage(errorMap[k]) || true);
                if (!isAdded) {
                    angular.forEach(v, function (err) {
                        debugger;
                        err.$name
                            && errorMap[err.$name]
                            && addErrorMessage(errorMap[err.$name]);
                    });
                }
            });
        }

        $scope.save = function () {
            checkErrors();
            if ($scope._form.mainForm.$invalid)
                return;

            if (ScreensaverService.saveSettings($scope.config)) {
                addInfoMessage($scope.translations.updateSuccess);
                $scope._form.mainForm.$setPristine();
            }
            else {
                addErrorMessage($scope.translations.updateFail);
            }

        }

        $scope.cancel = function () {
            if (!$scope._form.mainForm.$pristine) {
                prompt({
                    title: $scope.translations.cancelconfirmTitle,
                    message: $scope.translations.cancelconfirmMsg
                }).then(function () {
                    $route.reload();
                });
                return;
            }

            $location.url('/settings');
        }

        $scope.validate = function () {
            $timeout(function () {
                $scope.errorMessages = [];
                $scope.infoMessages = [];
                checkErrors();
                if ($scope._form.mainForm.$dirty) {
                    $scope.clearInfoMessage($scope.infoMessages.indexOf($scope.translations.updateSuccess));
                }
            });
        }

        $scope.sortableOptions = {
            connectWith: ".db-sortable",
            update: function () {
                $scope._form.mainForm.$setDirty();
                $scope.validate();
            }
        }

        $timeout($scope.validate);

        return ScreensaverSettingsCtrl;
    }
})();
