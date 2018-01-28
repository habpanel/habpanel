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
        let _dashboards = null;
        const _fallbackEventsToWatch = 'keydown DOMMouseScroll mousewheel mousedown touchstart touchmove';

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
                        dashboards: (() => {
                            _dashboards = PersistenceService.getDashboards();
                            let dbs = [];
                            let order = 0;
                            for (let db of _dashboards) {
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
            saveSettings(_config);
        }

        let disable = () => {
            _config.isEnabled = false;
            saveSettings(_config);
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

        let slideshow = () => {
            _dashboards = PersistenceService.getDashboards();
            let currentDbIndex = _dashboards.findIndex(db => db.id == $route.current.params.id);
            currentDbIndex = currentDbIndex < 0 ? 0 : currentDbIndex;
            $log.log(`Screensaver started in dashboard "${_dashboards[currentDbIndex].id}"`);

            let nextDashboard = () => {
                currentDbIndex = ++currentDbIndex < _dashboards.length ? currentDbIndex : 0;
                $location.url(`/view/${_dashboards[currentDbIndex].id}`);
            }

            nextDashboard();
            _slideshowTimer = $interval(nextDashboard, (_config.slideshowInterval || 10) * 1000);
        }

        let start = (isManual) => {
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
            $log.log(`Screensaver stopped.`);

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
