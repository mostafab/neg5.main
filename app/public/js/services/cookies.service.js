'use strict';

(function () {

    angular.module('tournamentApp').factory('Cookies', ['$cookies', function ($cookies) {

        var service = this;

        service.cookieFactory = {
            get: get,
            set: set,
            getObject: getObject,
            setObject: setObject,
            localStorage: localStorageWrapper()
        };

        function get(key) {
            return $cookies.get(key);
        }

        function getObject(key) {
            return $cookies.getObject(key);
        }

        function set(key, value) {
            $cookies.put(key, value);
        }

        function setObject(key, value) {
            $cookies.putObject(key, value);
        }

        function localStorageWrapper() {
            return {
                set: function set(key, value) {
                    localStorage.setItem(key, value);
                },
                get: function get(key) {
                    return localStorage.getItem(key);
                }
            };
        }

        return service.cookieFactory;
    }]);
})();