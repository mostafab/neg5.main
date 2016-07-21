(() => {
   
   angular.module('tournamentApp')
        .factory('Cookies', ['$cookies', function($cookies) {
            
            let service = this;
            
            service.cookieFactory = {
                get,
                set
            }

            function get(key) {
                return $cookies.get(key);
            }

            function set(key, value) {
                $cookies.put(key, value);
            }
            
            return service.cookieFactory;
            
        }]); 
        
})();