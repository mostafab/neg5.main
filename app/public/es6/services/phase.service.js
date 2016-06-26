(() => {
   
   angular.module('tournamentApp')
        .factory('Phase', ['$http', '$q', function($http, $q) {
            
            let service = this;
            
            let phases = [];
            
            service.phaseFactory = {
                phases,
                postPhase,
                getPhases,
                deletePhase
            }
            
            function postPhase() {
                
            }
            
            function getPhases(tournamentId) {
                $http.get('/t/' + tournamentId + '/phases')
                    .then(({data}) => {
                        angular.copy(data.phases, service.phaseFactory.phases);
                    })
            }
            
            function deletePhase(id) {

            }
            
            return service.gameFactory;
            
        }]); 
        
})();