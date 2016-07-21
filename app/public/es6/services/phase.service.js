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
                        let formattedPhases = data.phases.map(({active = false, name, phase_id: id}) => {
                            return {
                                active,
                                name,
                                id
                            }
                        });
                        angular.copy(formattedPhases, service.phaseFactory.phases);
                    })
            }
            
            function deletePhase(id) {

            }
            
            return service.phaseFactory;
            
        }]); 
        
})();