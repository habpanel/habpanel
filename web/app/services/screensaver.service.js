(function () {
    'use strict';

    angular
        .module('app.services')
        .service('ScreensaverService', ScreensaverService)
        .run(['ScreensaverService', (ScreensaverService) => {
            ScreensaverService.init()
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
        
        let _isIdle = false;
        let _isRunning = false;
        let _config = localStorageService.get('screensaverConfig');
        let _slideshowTimer = null;
        let _idleTimer = null;
        let _slideshowDashboards = null;
        let _currentDbIndex = 0;
        let log = (m) => {
            $log.log(`ScreensaverService: ${m}`);
        }

        let initConfig = () => {
            if (_config)
                return;

            // Set default
            localStorageService.set('screensaverConfig', {
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
                    dashboards: (() => {
                        _slideshowDashboards = PersistenceService.getDashboards();
                        let dbs = [];
                        let order = 0;
                        for (let db of _slideshowDashboards) {
                            dbs.push({
                                id: db.id,
                                order: ++order
                            });
                        }
                        return dbs;
                    })(),
                    dashboard: null
                },
                onStop: {
                    type: 'stop',
                    dashboard: null
                }
            });

        }

        let getEventsToWatch = () => {
            let e1 = [];
            for (let k in _config.eventsToWatch) {
                if (_config.eventsToWatch[k])
                    e1.push(k);
            }
            let e2 = _config.additionalEventsToWatch || [];
            // Use _defaultEventsToWatch if empty. Otherwise screensaver will never stop!
            let e3 = e1.concat(e2).join(' ').trim() || _fallbackEventsToWatch;
            return e3;
        }

        let enable = () => {
            _config.isEnabled = true;
            saveSettings();
        }

        let disable = () => {
            _config.isEnabled = false;
            saveSettings();
        }

        let toggle = (isEnabled) => {
            if (isEnabled)
                enable();
            else
                disable();
        }

        let isRunning = () => {
            return _isRunning;
        }

        let onIdle = () => {
            _isIdle = true;
            start();
        }

        let onAwake = () => {
            _isIdle = false;
            stop();
        }

        let watchEvents = () => {
            $document.on(getEventsToWatch(), onAwake);
        }

        let unWatchEvents = () => {
            $document.off(getEventsToWatch(), onAwake);
        }

        let dashboardExists = (dbId) => {
            return $rootScope.dashboards.findIndex(db => db.id == dbId) != -1;
        }

        let removeDashboard = (dbId, whichDb, isSave) => {
            whichDb = whichDb || _config.onStart.dashboards;
            let idx = whichDb.findIndex(db => db.id == dbId);
            if (idx != -1) {
                whichDb.splice(idx, 1);
            }

            if (typeof (isSave) === 'undefined')
                isSave = true;

            if (isSave)
                saveSettings();
        }

        let nextDashboard = () => {
            _slideshowDashboards = (_config.onStart.dashboards || []).sort((a, b) => a.order - b.order);

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

            let nextDbId = _slideshowDashboards[_currentDbIndex].id;
            if (!dashboardExists(nextDbId)) {
                removeDashboard(nextDbId);
                nextDashboard();
                return;
            }
            _currentDbIndex = ++_currentDbIndex < _slideshowDashboards.length ? _currentDbIndex : 0;
            $location.url(`/view/${nextDbId}`);
        }

        let slideshow = () => {
            log(`Screensaver (${_config.onStart.type}) started in dashboard "${$route.current.params.id}"`);
            _currentDbIndex = 0;
            nextDashboard();
            _slideshowTimer = $interval(nextDashboard, (_config.slideshowInterval || 10) * 1000);
        }

        let start = () => {
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

        let stop = (isFromOHService) => {
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

        let idleTimerStart = () => {
            _idleTimer = $timeout(onIdle, _config.idleTimeoutSec * 1000);
        }

        let idleTimerStop = () => {
            $timeout.cancel(_idleTimer);
            _idleTimer = null;
        }

        let init = () => {
            $timeout(() => {
                initConfig();
                if (!_config || !_config.idleTimeoutSec || !_config.isEnabled)
                    return;
                idleTimerStart();
            });
        };

        let saveSettings = (config) => {
            config = config || _config;
            // Uniqify our arrays
            config.onStart.dashboards = [...new Set(config.onStart.dashboards)];
            config.onStart.dashboardsExcluded = [...new Set(config.onStart.dashboardsExcluded)];
            let isSuccess = localStorageService.set('screensaverConfig', config);
            if (isSuccess)
                _config = config;
            init();
            return isSuccess;
        }

        Object.defineProperty(this, "isEnabled", {
            get: () => _config.isEnabled,
            set: (v) => {
                _config.isEnabled = v;
                saveSettings(_config);
            }
        })

        let reConfig = () => {
            // Iterate through _config.onStart.dashboards, remove all dashboards not in $rootScope.dashboards
            for (let ours of _config.onStart.dashboards) {
                if ($rootScope.dashboards.findIndex(theirs => theirs.id == ours.id) === -1)
                    removeDashboard(ours.id, _config.onStart.dashboards, false);
            }
            // Iterate through _config.onStart.dashboardsExcluded, remove all dashboards not in $rootScope.dashboards
            for (let ours of _config.onStart.dashboardsExcluded) {
                if ($rootScope.dashboards.findIndex(theirs => theirs.id == ours.id) === -1)
                    removeDashboard(ours.id, _config.onStart.dashboardsExcluded, false);
            }

            // Iterate through $rootScope.dashboards.
            // Anything new here will be added to _config.onStart.dashboardsExcluded
            let combined = _config.onStart.dashboards.concat(_config.onStart.dashboardsExcluded);
            for (let theirs of $rootScope.dashboards) {
                let isFound = combined.findIndex(ours => ours.id == theirs.id) !== -1;
                if (!isFound)
                    _config.onStart.dashboardsExcluded.push({ id: theirs.id });
            }

            if (!combined.length) {
                _config.isEnabled = false;
                stop();
            }

            if (combined.length < 2) {
                _config.onStart.type = 'gotodashboard';
                if (!_config.onStart.dashboard || !dashboardExists(_config.onStart.dashboard))
                    _config.onStart.dashboard = combined[0].id;
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
        this.config = _config;
        this.saveSettings = saveSettings;
        this.toggle = toggle;

        return this;
    }
})();
