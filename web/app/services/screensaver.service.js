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

        let statuses = {
            stop: 0,
            play: 1,
            pause: 2
        }

        let _isIdle = false;
        let _isRunning = false;
        let _config = localStorageService.get('screensaverConfig');
        let _slideshowTimer = null;
        let _idleTimer = null;
        let _slideshowDashboards = null;
        const _fallbackEventsToWatch = 'keydown DOMMouseScroll mousewheel mousedown touchstart touchmove';

        let log = (m) => {
            $log.log(`ScreensaverService: ${m}`);
        }

        let initConfig = () => {
            if (!_config) {
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
                                    enabled: true,
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

        let removeDashboardFromSlideshow = (dbId) => {
            let idx = _config.onStart.dashboards.findIndex(db => db.id == dbId);
            if (idx != -1) {
                _config.onStart.dashboards.splice(idx, 1);
            }
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

            let nextDbId = _slideshowDashboards[currentDbIndex].id;
            if (!dashboardExists(nextDbId)) {
                removeDashboardFromSlideshow(nextDbId);
                nextDashboard();
                return;
            }
            currentDbIndex = ++currentDbIndex < _slideshowDashboards.length ? currentDbIndex : 0;
            $location.url(`/view/${nextDbId}`);
        }

        let slideshow = () => {
            log(`Screensaver (${_config.onStart.type}) started in dashboard "${$route.current.params.id}"`);
            currentDbIndex = 0;
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
