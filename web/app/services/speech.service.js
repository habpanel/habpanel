(function() {
'use strict';

    angular
        .module('app.services')
        .service('SpeechService', SpeechService);

    SpeechService.$inject = ['$window', '$q', '$filter'];
    function SpeechService($window, $q, $filter) {
        this.getVoices = getVoices;
        this.speak = speak;
        
        ////////////////

        function getVoices() {
            if (!('SpeechSynthesisUtterance' in window))
                return [];

            return speechSynthesis.getVoices();
        }


        function speak(voicename, text) {
            if (!('SpeechSynthesisUtterance' in window)) {
                console.log('No support for speech synthesis on this platform!');
                return;
            }

            if (!speechSynthesis.getVoices()) {
                console.log("No voices?");
            }

            var utterance = new SpeechSynthesisUtterance(text);
            var voice = $filter('filter')(speechSynthesis.getVoices(), {name: voicename})[0];
            utterance.voice = voice;
            if (voice.lang) utterance.lang = voice.lang;

            speechSynthesis.speak(utterance);
        }
    }
})();