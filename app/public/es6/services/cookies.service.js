(() => {
   
   angular.module('tournamentApp')
        .factory('Cookies', ['$cookies', function($cookies) {
            
            let service = this;
            
            service.cookieFactory = {
                get,
                set,
                getObject,
                setObject
            }

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
            
            return service.cookieFactory;
            
        }]); 
        
})();