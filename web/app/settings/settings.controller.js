(function() {
'use strict';

    angular
        .module('app')
        .controller('SettingsCtrl', SettingsController);

    SettingsController.$inject = ['$rootScope', '$timeout', 'OH2ServiceConfiguration', 'OH2StorageService', 'PersistenceService', 'themes',  'prompt'];
    function SettingsController($rootScope, $timeout, OH2ServiceConfiguration, OH2StorageService, PersistenceService, themes, prompt) {
        var vm = this;

        vm.editorOptions = {
            lineNumbers: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            mode: "application/json",
            json: true,
            theme: "rubyblue"
        };

        vm.themes = themes.data;
        if (!$rootScope.settings.theme)
            $rootScope.settings.theme = 'default';

        vm.background_image = $rootScope.settings.background_image;

        vm.rawLocalConfig = JSON.stringify($rootScope.dashboards, null, 4);

        //vm.serviceConfiguration = OH2ServiceConfiguration;
        vm.useRegistry = $rootScope.useRegistry;
        vm.panelsRegistry = $rootScope.panelsRegistry;

        vm.saveAsNewPanelConfig = function () {
            prompt({
                title: "New panel configuration",
                message: "Please choose a name for the new panel configuration (letters and digits only please):",
                input: true
            }).then(function (name) {
                vm.panelsRegistry[name] = { 
                    "dashboards" : $rootScope.dashboards, 
                    "updatedTime": new Date().toISOString() 
                };
                vm.storageOption = name;
                OH2StorageService.setCurrentPanelConfig(name);
                OH2StorageService.saveCurrentPanelConfig();
            });

        };

        vm.deletePanelConfig = function (name) {
            prompt({
                title: "Remove panel configuration",
                message: "Please confirm you wish to delete this panel configuration from the server's registry: " + name + ". Make sure no other instances are using this panel set!",
            }).then(function () {
                delete vm.panelsRegistry[name];
                OH2StorageService.saveServiceConfiguration();
            });
        };

        vm.switchToPanelConfig = function (evt) {
            if (vm.storageOption === '(localStorage)') {
                OH2StorageService.useLocalStorage();
            } else {
                if (!OH2StorageService.getCurrentPanelConfig() && !confirm("Switching from local storage to a panel configuration will overwrite your local configuration! Are you sure?")) {
                    vm.storageOption = '(localStorage)';
                    evt.preventDefault();
                } else {
                    OH2StorageService.setCurrentPanelConfig(vm.storageOption);
                }
            }
        };

        vm.saveOptions = function () {
            $rootScope.settings.background_image = vm.background_image;
            PersistenceService.saveDashboards();
        }

        activate();

        ////////////////

        function activate() {
            vm.storageOption = "(localStorage)";
            if (OH2StorageService.getCurrentPanelConfig()) {
                vm.storageOption = OH2StorageService.getCurrentPanelConfig();
            }

            $timeout(function () {
                vm.refreshEditor = new Date();
            }, 200);
        }
    }
})();