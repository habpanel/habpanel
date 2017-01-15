(function() {
'use strict';

    angular
        .module('app')
        .controller('SettingsCtrl', SettingsController);

    SettingsController.$inject = ['$rootScope', '$timeout', '$window', 'OHService', 'OH2ServiceConfiguration', 'OH2StorageService', 'PersistenceService', 'SpeechService', 'themes', 'prompt'];
    function SettingsController($rootScope, $timeout, $window, OHService, OH2ServiceConfiguration, OH2StorageService, PersistenceService, SpeechService, themes, prompt) {
        var vm = this;

        vm.themes = themes.data;
        //vm.voices = SpeechService.getVoices();
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
                    "dashboards"   : $rootScope.dashboards,
                    "menucolumns"  : $rootScope.menucolumns,
                    "customwidgets": $rootScope.customwidgets,
                    "settings"     : $rootScope.settings,
                    "updatedTime"  : new Date().toISOString()
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

        vm.getSpeechSynthesisVoices = function () {
            return SpeechService.getVoices();
        }

        vm.speakTestSentence = function () {
            var voice = $rootScope.settings.speech_synthesis_voice;
            SpeechService.speak(voice, "hab panel test 1 2 3");
        };

        vm.isStringItem = function (item) {
            return item.type.startsWith('String');
        }

        activate();

        ////////////////

        function activate() {
            vm.storageOption = "(localStorage)";
            if (OH2StorageService.getCurrentPanelConfig()) {
                vm.storageOption = OH2StorageService.getCurrentPanelConfig();
            }

            $timeout(function () {
                vm.voices = SpeechService.getVoices();
                OHService.reloadItems();
            }, 200);

            if (window.speechSynthesis && window.speechSynthesis.addEventListener) {
                speechSynthesis.addEventListener('voiceschanged', function onVoiceChanged() {
                    speechSynthesis.removeEventListener('voiceschanged', onVoiceChanged);

                    vm.voices = speechSynthesis.getVoices();
                });
            }
    
            iNoBounce.disable();
            
        }
    }
})();