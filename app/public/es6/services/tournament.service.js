(() => {
   
   angular.module('tournamentApp')
        .factory('Tournament', ['$http', '$q', function($http, $q) {
            
            let service = this;
            
            let pointScheme = [];
            
            service.tournamentFactory = {
                pointScheme,
                getTournamentContext
            }
            
            function getTournamentContext(tournamentId) {
                return $q((resolve, reject) => {
                    $http.get('/api/t/' + tournamentId)
                        .then(({data}) => {
                            resolve({
                                tournamentInfo: {
                                    name: data.name,
                                    location: data.location,
                                    questionSet: data.questionSet,
                                    description: data.description,
                                    hidden: data.hidden || true,
                                    pointScheme: data.pointScheme || []
                                },
                                tournamentContext: {
                                    admin: true,
                                    owner: true
                                }
                            });
                        })
                        .catch(error => {
                            reject(error);
                        })
                })
                
            }
            
            return service.tournamentFactory;
            
        }]); 
        
})();