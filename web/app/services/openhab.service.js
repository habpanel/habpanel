(function() {
'use strict';

    angular
        .module('app.services')
        .service('OHService', OHService)
        .value('OH2ServiceConfiguration', {})
        .service('OH2StorageService', OH2StorageService);

    OHService.$inject = ['$rootScope', '$http', '$q', '$timeout', '$interval', '$filter', 'atmosphereService'];
    function OHService($rootScope, $http, $q, $timeout, $interval, $filter, atmosphereService) {
        this.getItem = getItem;
        this.getItems = getItems;
        this.onUpdate = onUpdate;
        this.sendCmd = sendCmd;
        this.reloadItems = reloadItems;
        //this.clearAllLongPollings = clearAllLongPollings;

        var liveUpdatesEnabled = false;

        ////////////////

        function onUpdate(scope, name, callback) {
            var handler = $rootScope.$on('openhab-update', callback);
            scope.$on('$destroy', handler);
            //watchItem(name);
            //longPollUpdates(name);
        }

        function loadItems() {
            $http.get('/rest/items')
            .then(function (data) {
                console.log('Loaded OpenHAB items');

                if (data.data && data.data.item) { // openHAB 1
                    $rootScope.items = data.data.item;
                    if (!liveUpdatesEnabled) registerAtmosphere();
                } else if (angular.isArray(data.data)) { // openHAB 2
                    $rootScope.items = data.data;
                    if (!liveUpdatesEnabled) registerEventSource();
                } else {
                    console.log("Items not found?");
                    $rootScope.items = [];
                }
                $rootScope.$emit('openhab-update');
            });
        }

        function getItem(name) {
            var item = $filter('filter')($rootScope.items, {name: name}, true); 
            return (item && item.length == 1) ? item[0] : null;
        }

        function getItems() {
            return $rootScope.items;
        }

        function sendCmd(item, cmd) {
            $http({
                method: 'POST',
                url: '/rest/items/' + item,
                data: cmd,
                headers: { 'Content-Type': 'text/plain' }
            }).then(function (data) {
                console.log('Command sent: ' + item + '=' + cmd);

                // should be handled by server push messages but their delivery is erratic
                // so perform a full refresh every time a command is sent
                //loadItems();
            });
        }

        function reloadItems() {
            //clearAllLongPollings();
            loadItems();
            //longPollUpdates('');
        }

        
        function registerEventSource() {
            if (typeof(EventSource) !== "undefined") {
                var source = new EventSource('/rest/events');
                liveUpdatesEnabled = true;

                source.onmessage = function (event) {
                    try {
                        var evtdata = JSON.parse(event.data);
                        var topicparts = evtdata.topic.split('/');

                        if (evtdata.type === 'ItemStateEvent') {
                            var payload = JSON.parse(evtdata.payload);
                            var newstate = payload.value;
                            var item = $filter('filter')($rootScope.items, {name: topicparts[2]}, true)[0];
                            if (item && item.state !== payload.value) {
                                $timeout(function () {
                                    console.log("Updating " + item.name + " state from " + item.state + " to " + payload.value);
                                    item.state = payload.value;
                                    $rootScope.$emit('openhab-update');
                                });
                            }
                        }

                    } catch (e) {
                        console.log('SSE event issue: ' + e.message);
                    }
                }
                source.onerror = function (event) {
                    console.log('SSE connection error, reconnecting in 5 seconds');
                    liveUpdatesEnabled = false;
                    $timeout(registerEventSource, 5000);
                }
            }
        }

        function registerAtmosphere() {
            var request = {
                url: '/rest/items',
                contentType: 'application/json',
                logLevel: 'debug',
                transport: 'websocket',
                fallbackTransport: 'long-polling',
                attachHeadersAsQueryString: true,
                reconnectInterval: 5000,
                enableXDR: true,
                timeout: 60000
            };

            request.headers = { "Accept": "application/json" };

            request.onClientTimeout = function(response){
                $timeout(function () {
                        socket = atmosphereService.subscribe(request);
                        liveUpdatesEnabled = true;
                }, request.reconnectInterval);
            };

            request.onMessage = function (response) {
                try
                {
                    var data = atmosphere.util.parseJSON(response.responseBody);
                    if ($rootScope.items && data && data != "") {
                        var item = $filter('filter')($rootScope.items, {name: data.name}, true)[0];
                        if (item) {
                            $timeout(function () {
                                console.log("Received push message: Changing " + item.name + " state from " + item.state + " to " + data.state);
                                item.state = data.state;
                                $rootScope.$emit('openhab-update');
                            });
                        }
                    }
                } catch (e) {
                    console.log("Couldn't parse Atmosphere message: " + response);
                }
            };

            var socket = atmosphere.subscribe(request);
            liveUpdatesEnabled = true;
        }
    }

    OH2StorageService.$inject = ['OH2ServiceConfiguration', '$rootScope', '$http', '$q', 'localStorageService'];
    function OH2StorageService(OH2ServiceConfiguration, $rootScope, $http, $q, localStorageService) {
        var SERVICE_NAME = 'org.openhab.ui.habpanel';

        this.tryGetServiceConfiguration = tryGetServiceConfiguration;
        this.saveServiceConfiguration = saveServiceConfiguration;
        this.saveCurrentPanelConfig = saveCurrentPanelConfig;
        this.setCurrentPanelConfig = setCurrentPanelConfig;
        this.getCurrentPanelConfig = getCurrentPanelConfig;
        this.useCurrentPanelConfig = useCurrentPanelConfig;
        this.useLocalStorage = useLocalStorage;

        function tryGetServiceConfiguration() {
            var deferred = $q.defer();

            $http.get('/rest/services/' + SERVICE_NAME + '/config').then(function (resp) {
                /*if (!resp.data.hasOwnProperty('lockEditing')) {
                    console.log('Empty service configuration - service not installed?');
                    useLocalStorage();
                    deferred.reject();
                    return;
                }*/

                console.log('openHAB 2 service configuration loaded');
                OH2ServiceConfiguration = resp.data;
                if (!OH2ServiceConfiguration.panelsRegistry) {
                    $rootScope.panelsRegistry = OH2ServiceConfiguration.panelsRegistry = {};
                } else {
                    $rootScope.panelsRegistry = JSON.parse(resp.data.panelsRegistry);
                }
                if (OH2ServiceConfiguration.lockEditing === "true") {
                    $rootScope.lockEditing = true;
                }

                deferred.resolve();

            }, function (err) {
                console.log('Cannot load openHAB 2 service configuration: ' + JSON.stringify(err));

                deferred.reject();
            });

            return deferred.promise;
        }

        function saveServiceConfiguration() {
            var deferred = $q.defer();

            if ($rootScope.panelsRegistry) {
                OH2ServiceConfiguration.panelsRegistry = JSON.stringify($rootScope.panelsRegistry, null, 4);
            }

            $http({
                method: 'PUT',
                url: '/rest/services/' + SERVICE_NAME + '/config',
                data: OH2ServiceConfiguration,
                headers: { 'Content-Type': 'application/json' }
            }).then (function (resp) {
                console.log('openHAB 2 service configuration saved');
                deferred.resolve();
            }, function (err) {
                console.log('Error while saving openHAB 2 service configuration: ' + JSON.stringify(err));
                deferred.reject();
            });

            return deferred.promise;

        }

        function saveCurrentPanelConfig() {
            var deferred = $q.defer();

            var lastUpdatedTime = $rootScope.panelsRegistry[getCurrentPanelConfig()].updatedTime; 

            // fetch the current configuration again (to perform optimistic concurrency on the current panel config only)
            tryGetServiceConfiguration().then(function () {
                var config = $rootScope.panelsRegistry[getCurrentPanelConfig()];
                if (!config) {
                    console.log('Warning: creating new panel config!');
                    config = $rootScope.panelsRegistry[getCurrentPanelConfig()] = { };
                }
                var currentUpdatedTime = config.updatedTime;
                if (Date.parse(currentUpdatedTime) > Date.parse(lastUpdatedTime)) {
                    deferred.reject('Panel configuration has a newer version on the server updated on ' + currentUpdatedTime);
                    return;
                }
                config.updatedTime = new Date().toISOString();
                config.dashboards = angular.copy($rootScope.dashboards);
                return saveServiceConfiguration().then(function () {
                    deferred.resolve();
                }, function () {
                    deferred.reject();
                });
            });

            return deferred.promise;
        }

        function useLocalStorage() {
            $rootScope.currentPanelConfig = undefined;
            localStorageService.set("currentPanelConfig", $rootScope.currentPanelConfig);
        }

        function getCurrentPanelConfig() {
            if (!$rootScope.currentPanelConfig) {
                $rootScope.currentPanelConfig = localStorageService.get("currentPanelConfig");
            }

            return $rootScope.currentPanelConfig;
        }

        function useCurrentPanelConfig() {
            var currentPanelConfig = getCurrentPanelConfig();
            if (!currentPanelConfig || !$rootScope.panelsRegistry[currentPanelConfig]) {
                console.log("Warning: current panel config not found, falling back to local storage!");
                useLocalStorage();
            } else {
                $rootScope.dashboards = angular.copy($rootScope.panelsRegistry[currentPanelConfig].dashboards);
            }
        }

        function setCurrentPanelConfig(name) {
            $rootScope.currentPanelConfig = name;
            localStorageService.set("currentPanelConfig", $rootScope.currentPanelConfig);
            useCurrentPanelConfig();
        }

    }

})();
