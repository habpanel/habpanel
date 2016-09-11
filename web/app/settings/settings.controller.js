(function() {
'use strict';

    angular
        .module('app')
        .controller('SettingsCtrl', SettingsController);

    SettingsController.$inject = ['$rootScope', 'OH2ServiceConfiguration', 'OH2StorageService', 'PersistenceService', 'prompt'];
    function SettingsController($rootScope, OH2ServiceConfiguration, OH2StorageService, PersistenceService, prompt) {
        var vm = this;
        //vm.serviceConfiguration = OH2ServiceConfiguration;
        vm.useRegistry = $rootScope.useRegistry;
        vm.panelsRegistry = $rootScope.panelsRegistry;

        vm.saveAsNewPanelConfig = function () {
            prompt({
                title: "New panel configuration",
                message: "Please choose a name for the new panel configuration (letters and digits only please):",
                input: true
            }).then(function (name) {
                vm.panelsRegistry[name] = { "dashboards": $rootScope.dashboards, "updatedTime": new Date().toISOString() };
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

        vm.showLocalConfiguration = function () {
            prompt({
                title: "Show local configuration",
                message: "This is the raw configuration object. You can use this to backup/restore your entire config by copy-pasting the JSON to or from somewhere else. Be careful though - no checks are performed here!",
                input: true,
                label: "Configuration JSON object",
                value: JSON.stringify($rootScope.dashboards) 
            }).then(function (confstr) {
                try {
                    var newconf = JSON.parse(confstr);
                    // maybe add some checks here eventually
                    angular.copy(newconf, $rootScope.dashboards);
                    PersistenceService.saveDashboards();
                    PersistenceService.getDashboards();
                } catch (e) {
                    prompt({
                        title: "Error",
                        message: "Configuration parsing error, nothing has been modified: " + e,
                        buttons: [{ label:'OK', primary: true }]
                    });
                }
            });
        }

        activate();

        ////////////////

        function activate() {
            vm.storageOption = "(localStorage)";
            if (OH2StorageService.getCurrentPanelConfig()) {
                vm.storageOption = OH2StorageService.getCurrentPanelConfig();
            }
        }
    }
})();