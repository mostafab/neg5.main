(() => {
   
   angular.module('tournamentApp')
        .factory('Tournament', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            let pointScheme = [];
            
            service.tournamentFactory = {
                pointScheme,
                getTournamentContext,
                edit
            }
            
            function getTournamentContext(tournamentId) {
                return $q((resolve, reject) => {
                    const token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '?token=' + token)
                        .then(({data}) => {
                            const info = data.data;
                            resolve({
                                tournamentInfo: {
                                    name: info.name,
                                    location: info.location,
                                    date: new Date(info.tournament_date),
                                    questionSet: info.question_set,
                                    comments: info.comments,
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

            function edit(tournamentId, newTournamentInfo) {
                return $q((resolve, reject) => {
                    const token = Cookies.get('nfToken');
                    $http.put('/api/t/' + tournamentId + '?token=' + token)
                        .then(({data}) => {
                            console.log('Done');
                            resolve(newTournamentInfo);
                        })
                        .catch(error => reject(error));
                })
            }
            
            return service.tournamentFactory;
            
        }]); 
        
})();