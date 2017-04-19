(function() {
'use strict';

    angular
        .module('app')
        .controller('WidgetListCtrl', WidgetListController);

    WidgetListController.$inject = ['$rootScope', '$scope', 'widgets', 'PersistenceService', 'prompt', 'FileSaver', 'LocalFileReader'];
    function WidgetListController($rootScope, $scope, widgets, PersistenceService, prompt, FileSaver, LocalFileReader) {
        var vm = this;

        vm.addNewWidget = function () {
            prompt({
                title: "New custom widget",
                message: "Please choose a short name as an identifier for your widget (for example, 'window-shutter', 'up-down-button, 'weather-forecast' etc.). If a widget with the same identifier already exists, it will be replaced!",
                input: true
            }).then(function (id) {
                $rootScope.customwidgets[id] = { 
                };
                PersistenceService.saveDashboards();
            });
        };

        vm.showImportDialog = function () {
            document.getElementById('widget-file-select').click();
        }

        vm.importFile = function (file) {
            if (!file) return;
            if (file.name.indexOf(".json") == -1) {
                alert("The file must have a .json extension!");
                delete $scope.file;
                return;
            }
            prompt({
                title: "Import widget",
                message: "Please confirm or change the identifier of your widget (avoid spaces and special chars!). If a widget with the same identifier already exists, it will be replaced!",
                input: true,
                value: file.name.replace(".widget", "").replace(".json", "")
            }).then(function (id) {
                LocalFileReader.readFile(file, $rootScope).then(function (text) {
                    try {
                        var json = JSON.parse(text);
                        if (!json.template) throw "Invalid widget - no template";
                        console.log('Widget loaded from file: ' + file.name);
                        $rootScope.customwidgets[id] = json;
                        delete $scope.file;
                    } catch (e) {
                        prompt({
                            title: "Error",
                            message: "Widget import error: " + e,
                            buttons: [{ label:'OK', primary: true }]
                        });
                    }
                });
            });
        };

        vm.exportToFile = function (id, widget) {
            var data = new Blob([JSON.stringify(widget, null, 4)], { type: 'application/json;charset=utf-8'});
            FileSaver.saveAs(data, id + '.widget.json');
        };

        vm.deleteWidget = function (id) {
            prompt({
                title: "Remove widget",
                message: "Please confirm you want to delete this widget: " + id,
            }).then(function () {
                delete $rootScope.customwidgets[id];
                PersistenceService.saveDashboards();
            });
        };

        vm.cloneConfigWidget = function (originalId) {
            prompt({
                title: "Clone widget",
                message: "This will clone the globally provisioned widget: " + originalId + " to be modified as part of the panel configuration. Enter an unique identifier below - it must be different from the widget being cloned, and should avoid spaces and special chars. If an user-defined widget with the same identifier already exists, it will be replaced!",
                input: true,
                value: originalId + '-clone'
            }).then(function (id) {
                $rootScope.customwidgets[id] = angular.copy($rootScope.configWidgets[originalId]);
                PersistenceService.saveDashboards();
            })
        }

        activate();

        ////////////////

        function activate() {

        }
    }
})();
