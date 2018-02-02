(function () {
    'use strict';

    angular
        .module('app.services')
        .service('ScreensaverService', ScreensaverService)
        .run(['ScreensaverService', function (ScreensaverService) {
            ScreensaverService.init();
        }]);

    ScreensaverService.$inject = [
        'PersistenceService',
        '$location',
        '$interval',
        '$timeout',
        '$rootScope',
        'localStorageService',
        '$route',
        '$log',
        '$document'
    ];

    function ScreensaverService(
        PersistenceService,
        $location,
        $interval,
        $timeout,
        $rootScope,
        localStorageService,
        $route,
        $log,
        $document
    ) {

        const _fallbackEventsToWatch = 'keydown DOMMouseScroll mousewheel mousedown touchstart touchmove';

        var _isIdle = false;
        var _isRunning = false;
        var _config = localStorageService.get('screensaverConfig');
        var _slideshowTimer = null;
        var _idleTimer = null;
        var _slideshowDashboards = null;
        var _currentDbIndex = 0;
        var log = function (m) {
            $log.log(`ScreensaverService: ${m}`);
        }

        var initConfig = function () {
            if (_config)
                return;

            // Set default
            _config = {
                idleTimeoutSec: 60 * 5,
                slideshowIntervalSec: 5,
                isEnabled: false,
                eventsToWatch: {
                    'mousedown': true,
                    'keydown': true,
                    'mousewheel': true,
                    'touchstart': true,
                    'touchmove': true
                },
                additionalEventsToWatch: [],
                onStart: {
                    type: 'slideshow',
                    dashboardsExcluded: [],
                    dashboards: (function () {
                        _slideshowDashboards = PersistenceService.getDashboards();
                        var dbs = [];
                        var order = 0;
                        angular.forEach(_slideshowDashboards, function (db) {
                            dbs.push({
                                id: db.id,
                                order: ++order
                            });
                        });
                        return dbs;
                    })(),
                    dashboard: null
                },
                onStop: {
                    type: 'stop',
                    dashboard: null
                }
            };
            localStorageService.set('screensaverConfig', _config);
        }

        var getEventsToWatch = function () {
            var e1 = [];
            for (var k in _config.eventsToWatch) {
                if (_config.eventsToWatch[k])
                    e1.push(k);
            }
            var e2 = _config.additionalEventsToWatch || [];
            // Use _defaultEventsToWatch if empty. Otherwise screensaver will never stop!
            var e3 = e1.concat(e2).join(' ').trim() || _fallbackEventsToWatch;
            return e3;
        }

        var enable = function () {
            _config.isEnabled = true;
            saveSettings();
        }

        var disable = function () {
            _config.isEnabled = false;
            saveSettings();
        }

        var toggle = function (isEnabled) {
            if (isEnabled)
                enable();
            else
                disable();
        }

        var isRunning = function () {
            return _isRunning;
        }

        var onIdle = function () {
            _isIdle = true;
            start();
        }

        var onAwake = function () {
            _isIdle = false;
            stop();
        }

        var watchEvents = function () {
            $document.on(getEventsToWatch(), onAwake);
        }

        var unWatchEvents = function () {
            $document.off(getEventsToWatch(), onAwake);
        }

        var dashboardExists = function (dbId) {
            return $rootScope.dashboards.findIndex(function (db) { return db.id == dbId }) != -1;
        }

        var removeDashboard = function (dbId, whichDb, isSave) {
            whichDb = whichDb || _config.onStart.dashboards;
            var idx = whichDb.findIndex(function (db) { return db.id == dbId });
            if (idx != -1) {
                whichDb.splice(idx, 1);
            }

            if (typeof (isSave) === 'undefined')
                isSave = true;

            if (isSave)
                saveSettings();
        }

        var nextDashboard = function () {
            _slideshowDashboards = (_config.onStart.dashboards || []).sort(
                function (a, b) { return a.order - b.order; }
            );

            // No dashboards found
            if (_slideshowDashboards.length <= 0) {
                log("Stopping slideshow. No dashboard found.");
                stop();
                return;
            }

            // Only 1 dashboard found
            if (_slideshowDashboards.length == 1) {
                // Change configuration to gotodashboard
                _config.onStop.type === 'gotodashboard';
                saveSettings();
                $interval.cancel(_slideshowTimer);
                _slideshowTimer = null;
                log("Stopping slideshow. No dashboard found.");
                $location.url(`/view/${_config.onStart.dashboard}`);
                return;
            }

            var nextDbId = _slideshowDashboards[_currentDbIndex].id;
            if (!dashboardExists(nextDbId)) {
                removeDashboard(nextDbId);
                nextDashboard();
                return;
            }
            _currentDbIndex = ++_currentDbIndex < _slideshowDashboards.length ? _currentDbIndex : 0;
            $location.url(`/view/${nextDbId}`);
        }

        var slideshow = function () {
            log(`Screensaver (${_config.onStart.type}) started in dashboard "${$route.current.params.id}"`);
            _currentDbIndex = 0;
            nextDashboard();
            _slideshowTimer = $interval(nextDashboard, (_config.slideshowIntervalSec || 10) * 1000);
        }

        var start = function () {
            if (_isRunning)
                return;

            _isRunning = true;
            watchEvents();

            if (_config.onStart.type === 'slideshow') {
                slideshow();
            } else {
                $location.url(`/view/${_config.onStart.dashboard}`)
            }
        };

        var stop = function (isFromOHService) {
            if (!_isRunning)
                return;

            unWatchEvents();
            $interval.cancel(_slideshowTimer);
            _slideshowTimer = null;
            _isRunning = false;
            log(`Screensaver stopped.`);

            if (_config.isEnabled) {
                idleTimerStart();
            }

            if (isFromOHService)
                return;

            if (_config.onStop.type === 'gotodashboard') {
                $location.url(`/view/${_config.onStop.dashboard}`);
            }
        };

        var idleTimerStart = function () {
            _idleTimer = $timeout(onIdle, _config.idleTimeoutSec * 1000);
        }

        var idleTimerStop = function () {
            $timeout.cancel(_idleTimer);
            _idleTimer = null;
        }

        var init = function () {
            $timeout(function () {
                initConfig();
                if (!_config || !_config.idleTimeoutSec || !_config.isEnabled)
                    return;
                idleTimerStart();
            });
        };

        var saveSettings = function (config) {
            config = config || _config;
            // Uniqify our arrays
            config.onStart.dashboards = [...new Set(config.onStart.dashboards)];
            config.onStart.dashboardsExcluded = [...new Set(config.onStart.dashboardsExcluded)];
            var isSuccess = localStorageService.set('screensaverConfig', config);
            if (isSuccess)
                _config = config;
            init();
            return isSuccess;
        }

        Object.defineProperty(this, "isEnabled", {
            get: function () { return _config.isEnabled; },
            set: function (v) {
                _config.isEnabled = v;
                saveSettings(_config);
            }
        })

        Object.defineProperty(this, "config", {
            get: function () { return _config; }
        })

        var reConfig = function () {
            if (!_config) {
                initConfig();
            }

            var freshDashboards = PersistenceService.getDashboards();
            if (!freshDashboards) {
                _config.isEnabled = false;
                saveSettings();
                return;
            }

            // Iterate through _config.onStart.dashboards, remove all dashboards not in $rootScope.dashboards
            angular.forEach(_config.onStart.dashboards, function (ours) {
                if ($rootScope.dashboards.findIndex(function (theirs) { return theirs.id == ours.id }) === -1)
                    removeDashboard(ours.id, _config.onStart.dashboards, false);
            });
            // Iterate through _config.onStart.dashboardsExcluded, remove all dashboards not in $rootScope.dashboards
            angular.forEach(_config.onStart.dashboardsExcluded, function (ours) {
                if ($rootScope.dashboards.findIndex(function (theirs) { return theirs.id == ours.id }) === -1)
                    removeDashboard(ours.id, _config.onStart.dashboardsExcluded, false);
            });

            // Iterate through $rootScope.dashboards.
            // Anything new here will be added to _config.onStart.dashboardsExcluded
            var combined = _config.onStart.dashboards.concat(_config.onStart.dashboardsExcluded);
            angular.forEach($rootScope.dashboards, function (theirs) {
                var isFound = combined.findIndex(function (ours) { return ours.id == theirs.id; }) !== -1;
                if (!isFound)
                    _config.onStart.dashboardsExcluded.push({ id: theirs.id });
            });

            if (!combined.length) {
                _config.isEnabled = false;
                stop();
            } else {

                if (combined.length < 2) {
                    _config.onStart.type = 'gotodashboard';
                    if (!_config.onStart.dashboard || !dashboardExists(_config.onStart.dashboard))
                        _config.onStart.dashboard = combined[0] && combined[0].id;
                }

                if (!_config.onStop.dashboard || !dashboardExists(_config.onStop.dashboard)) {
                    _config.onStop.dashboard = freshDashboards[0].id;
                    if (_config.onStop.type === 'gotodashboard') {
                        _config.onStop.type = 'stop';
                    }
                }
            }
            saveSettings();
        }

        /* Monitor Configuration Changes to modify _config */
        $rootScope.$on('configurationChanged', reConfig);
        $rootScope.$on('configurationLoaded', reConfig);

        /* Exposed APIs */
        this.init = init;
        this.start = start;
        this.stop = stop;
        this.isRunning = isRunning;
        this.saveSettings = saveSettings;
        this.toggle = toggle;

        return this;
    }
})();
