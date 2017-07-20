(function() {
'use strict';

    angular
        .module('app')
        .controller('WidgetImportGitHubCtrl', WidgetImportGitHubController);

    WidgetImportGitHubController.$inject = ['$scope', '$rootScope', '$http', '$q', '$uibModalInstance', 'prompt', 'PersistenceService'];
    function WidgetImportGitHubController($scope, $rootScope, $http, $q, $modalInstance, prompt, PersistenceService) {
        var vm = this;

        vm.getRateLimits = function () {
            $http.get('https://api.github.com/rate_limit').then(function (resp) {
                if (resp.data && resp.data.resources) vm.rateLimit = resp.data.resources.core;
            });
        }

        vm.fetchRepo = function () {
            if (!vm.repoId) return;
            if (vm.repoId.indexOf('https://github.com/') === 0) {
                vm.repoId = vm.repoId.replace('https://github.com/', '');
            }

            vm.widgets = null;
            vm.loadingRepo = true;
            vm.error = null;
            vm.importableWidgets = vm.updatableWidgets = 0;
            vm.progressMax = 4;
            vm.progressCurrent = 0;

            try {
                if (vm.repoId.indexOf('/') < 0 || vm.repoId.indexOf('/') !== vm.repoId.lastIndexOf('/')) return;
                $http.get('https://api.github.com/repos/' + vm.repoId)
                .then(function (resp) {
                    if (resp.data) {
                        vm.repoDetails = resp.data;
                        vm.progressCurrent = 1;
                        $http.get('https://api.github.com/repos/' + vm.repoId + '/readme',
                        { headers: { 'Accept': 'application/vnd.github.v3.html' } }
                        ).then(function (readme) {
                            vm.progressCurrent = 2;
                            if (readme.data) {
                                vm.readme = readme.data;
                            }

                            $http.get('https://api.github.com/repos/' + vm.repoId + '/contents')
                            .then(function (resp) {
                                if (resp.data) {
                                    vm.progressCurrent = 3;
                                    var widgetrequests = [];
                                    angular.forEach(resp.data, function (file) {
                                        if (file.name.indexOf('.widget.json') > 0) {
                                            widgetrequests.push($http.get(file.download_url, { widget_id: file.name.replace('.widget.json', '') }));
                                        }
                                    });

                                    $q.all(widgetrequests).then(function (widgets) {
                                        vm.progressCurrent = 4;
                                        angular.forEach(widgets, function (widget) {
                                            if (!vm.widgets) vm.widgets = {};

                                            if (widget.data && widget.data && widget.data.template) {
                                                if (PersistenceService.getCustomWidget(widget.config.widget_id)) {
                                                    widget.data.is_update = true;
                                                    vm.updatableWidgets += 1;
                                                }
                                                vm.importableWidgets += 1;
                                                widget.data.source_url = widget.config.url;
                                                widget.data.readme_url = "https://github.com/" + vm.repoId;
                                                vm.widgets[widget.config.widget_id] = widget.data;
                                            }
                                        });

                                        vm.loadingRepo = false;
                                    });
                                }
                            });
                        })
                    }
                });
            } catch (e) {
                vm.error = JSON.stringify(e);
                vm.loadingRepo = false;
                vm.repoDetails = undefined;
            } finally {
                vm.getRateLimits();
            }
        }

        vm.importWidget = function (id, update) {
            var widget = angular.copy(vm.widgets[id]);
            delete widget.is_update;
            $rootScope.customwidgets[id] = widget;
            vm.widgets[id].imported = true;
            vm.importableWidgets -= 1;
            if (update) vm.updatableWidgets -= 1;
            PersistenceService.saveDashboards();
        }

        $scope.dismiss = function () {
            $modalInstance.dismiss();
        };

        $scope.submit = function () {
            if (vm.updatableWidgets > 0) {
                prompt({
                    title: "Existing widgets detected",
                    message: "Warning: please confirm you wish to update " + vm.updatableWidgets + " existing widgets, overwriting any eventual changes made locally! If unsure, cancel and click Show details to review the list of affected widgets.",
                }).then(function () {
                    $modalInstance.close(vm.widgets);
                });
            } else {
                $modalInstance.close(vm.widgets);
            }
        };

        vm.getRateLimits();

    }
})();
