(() => {
   
   angular.module('tournamentApp')
        .factory('Phase', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            let phases = [];
            
            service.phaseFactory = {
                phases,
                postPhase,
                editPhase,
                getPhases,
                deletePhase
            }
            
            function postPhase() {
                
            }

            function editPhase(tournamentId, newName, phaseId) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        newName
                    }
                    $http.put('/api/t/' + tournamentId + '/phases/' + phaseId, body)
                        .then(({data}) => {
                            updatePhaseInArray(data.result.id, data.result.name)
                            resolve(data.result.name);
                        })
                        .catch(error => reject(error));
                })
            }
            
            function getPhases(tournamentId) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '/phases?token=' + token)
                        .then(({data}) => {
                            let formattedPhases = data.result.map(({name, id}) => {
                                return {
                                    name,
                                    newName: name,
                                    id
                                }
                            });
                            angular.copy(formattedPhases, service.phaseFactory.phases);
                            resolve(formattedPhases);
                        })
                        .catch(error => reject(error));
                })
                
            }
            
            function deletePhase(id) {

            }

            function updatePhaseInArray(id, newName) {
                let index = service.phaseFactory.phases.findIndex(phase => phase.id === id);
                if (index !== -1) {
                    service.phaseFactory.phases[index].name = newName;
                }
            }
            
            return service.phaseFactory;
            
        }]); 
        
})();