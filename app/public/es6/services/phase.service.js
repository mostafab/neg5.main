(() => {
   
   angular.module('tournamentApp')
        .factory('Phase', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
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
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '/phases?token=' + token)
                        .then(({data}) => {
                            let formattedPhases = data.result.map(({name, id}) => {
                                return {
                                    name,
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
            
            return service.phaseFactory;
            
        }]); 
        
})();