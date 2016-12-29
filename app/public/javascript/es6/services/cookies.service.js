(() => {
   
   angular.module('tournamentApp')
        .factory('Cookies', ['$cookies', function($cookies) {
            
            let service = this;
            
            service.cookieFactory = {
                get,
                set,
                remove,
                getObject,
                setObject,
                localStorage: localStorageWrapper()
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

            function remove(key) {
                console.log($cookies.get(key));
                $cookies.remove(key);
                console.log($cookies.get(key));
            }

            function setObject(key, value) {
                $cookies.putObject(key, value);
            }
            
            function localStorageWrapper() {
                return {
                    set: (key, value) => {
                        localStorage.setItem(key, value);
                    },
                    get: (key) => {
                        return localStorage.getItem(key)
                    }
                }
            }
            
            
            return service.cookieFactory;
            
        }]); 
        
})();