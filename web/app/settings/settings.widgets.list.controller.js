(function() {
'use strict';

    angular
        .module('app')
        .controller('WidgetListCtrl', WidgetListController);

    WidgetListController.$inject = ['$rootScope', '$scope', '$http', 'widgets', 'PersistenceService', 'prompt', 'FileSaver', 'LocalFileReader', '$uibModal', '$ocLazyLoad'];
    function WidgetListController($rootScope, $scope, $http, widgets, PersistenceService, prompt, FileSaver, LocalFileReader, $modal, $ocLazyLoad) {
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

        vm.showImportGalleryDialog = function () {
            $ocLazyLoad.load('app/settings/settings.widgets.gallery.controller.js').then(function () {
                $modal.open({
                    scope: $scope,
                    templateUrl: 'app/settings/settings.widgets.gallery.tpl.html',
                    controller: 'WidgetGalleryCtrl',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                }).result.then(function (widgets) {
                    angular.forEach(widgets, function (widget, id) {
                        delete widget.is_update;
                        $rootScope.customwidgets[id] = angular.copy(widget);
                    });
                    PersistenceService.saveDashboards();
                });
            });
        };

        vm.exportToFile = function (id, widget) {
            var data = new Blob([JSON.stringify(widget, null, 4)], { type: 'application/json;charset=utf-8'});
            FileSaver.saveAs(data, id + '.widget.json');
        };

        vm.updateWidget = function (id) {
            var widget = $rootScope.customwidgets[id];
            if (widget.source_url) {
                var source_url = widget.source_url;
                var readme_url = widget.readme_url;

                prompt({
                    title: "Update widget",
                    message: "This will update widget " + id + " from " + source_url + ". Any changes you made will be overwritten! Continue?",
                }).then(function () {
                    $http.get(widget.source_url).then(function (resp) {
                        if (resp.data) {
                            if (!resp.data.template) {
                                vm.updateErrorMessage = "Couldn't update widget " + id + " from " + widget.source_url + ": no template found";
                            } else {
                                resp.data.source_url = source_url;
                                resp.data.readme_url = readme_url;
                                $rootScope.customwidgets[id] = resp.data;
                                PersistenceService.saveDashboards();
                                vm.updatedMessage = "Widget " + id + " updated successfully from " + source_url;
                            }
                        } else {
                            vm.updateErrorMessage = "Couldn't update widget " + id + " from " + widget.source_url + ": " + resp.statusText;
                        }
                    });
                });
            }
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
