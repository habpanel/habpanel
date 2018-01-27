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

        //TODO: REMOVE
        localStorageService.set('screensaverConfig', {
            idleTimeoutSec: 5,
            slideshowIntervalSec: 5,
            isEnabled: false,
            eventsToWatch: 'keydown mousewheel mousedown touchstart touchmove'
        });

        let _isIdle = false;
        let _isRunning = false;
        let _config = localStorageService.get('screensaverConfig');
        let _slideshowTimer = null;
        let _idleTimer = null;
        let _dashboards = null;
        let _eventsToWatch = 'keydown DOMMouseScroll mousewheel mousedown touchstart touchmove';

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
            $document.on(_eventsToWatch, onAwake);
        }

        let unWatchEvents = () => {
            $document.off(_eventsToWatch, onAwake);
        }

        let start = (isManual) => {
            if (_isRunning)
                return;

            _dashboards = PersistenceService.getDashboards();
            let currentDbIndex = _dashboards.findIndex(db => db.id == $route.current.params.id);
            currentDbIndex = currentDbIndex < 0 ? 0 : currentDbIndex;
            $log.log(`Screensaver started in dashboard "${_dashboards[currentDbIndex].id}"`);

            let nextDashboard = () => {
                _isRunning = true;
                currentDbIndex = ++currentDbIndex < _dashboards.length ? currentDbIndex : 0;
                $location.url(`/view/${_dashboards[currentDbIndex].id}`);
            }
            
            nextDashboard();
            _slideshowTimer = $interval(nextDashboard, (_config.slideshowInterval || 10) * 1000);
        };

        let stop = () => {
            if (!_isRunning)
                return;

            $interval.cancel(_slideshowTimer);
            _slideshowTimer = null;
            _isRunning = false;
            $log.log(`Screensaver stopped.`);

            if (_config.isEnabled) {
                idleTimerStart();
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
            if (!_config || !_config.idleTimeoutSec || !_config.isEnabled)
                return;

            idleTimerStart();
        };

        /* Exposed APIs */
        this.init = init;
        this.start = start;
        this.stop = stop;
        this.isRunning = isRunning;
        this.config = _config;

        return this;
    }
})();
