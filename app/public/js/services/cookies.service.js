'use strict';

(function () {

    angular.module('tournamentApp').factory('Cookies', ['$cookies', function ($cookies) {

        var service = this;

        service.cookieFactory = {
            get: get,
            set: set
        };

        function get(key) {
            return $cookies.get(key);
        }

        function set(key, value) {
            $cookies.put(key, value);
        }

        return service.cookieFactory;
    }]);
})();