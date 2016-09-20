(function() {
'use strict';

    angular
        .module('app')
        .controller('SettingsLocalConfigCtrl', SettingsLocalConfigController);

    SettingsLocalConfigController.$inject = ['$rootScope', '$timeout', 'OH2ServiceConfiguration', 'OH2StorageService', 'PersistenceService', 'prompt', 'clipboard'];
    function SettingsLocalConfigController($rootScope, $timeout, OH2ServiceConfiguration, OH2StorageService, PersistenceService, prompt, clipboard) {
        var vm = this;

        vm.editorOptions = {
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            mode: "application/json",
            json: true,
            theme: "rubyblue",
            viewportMargin: Infinity
        };

        function resetButtons() {
            vm.saveLabel = "Save";
            vm.copyLabel = "Copy";
        }

        vm.rawLocalConfig = JSON.stringify($rootScope.dashboards, null, 4);

        vm.copiedToClipboard = function (success) {
            if (success) {
                vm.copyLabel = "Copied!";
                $timeout(resetButtons, 2000);
            } else {
                vm.copyLabel = "FAILED!";
                $timeout(resetButtons, 2000);
            }
        };

        vm.saveConfig = function () {
            try {
                var newconf = JSON.parse(vm.rawLocalConfig);
                // maybe add some checks here eventually
                angular.copy(newconf, $rootScope.dashboards);
                PersistenceService.saveDashboards();
                PersistenceService.getDashboards();
                vm.saveLabel = "Saved!";
                $timeout(resetButtons, 2000);
            } catch (e) {
                prompt({
                    title: "Error",
                    message: "Configuration parsing error, nothing has been modified: " + e,
                    buttons: [{ label:'OK', primary: true }]
                });
            }
        };

        activate();

        ////////////////

        function activate() {
            $timeout(function () {
                vm.refreshEditor = new Date();
            }, 200);

            resetButtons();
        }
    }
})();