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
                            angular.copy(info.tossup_point_scheme, service.tournamentFactory.pointScheme);
                            resolve({
                                tournamentInfo: {
                                    name: info.name,
                                    location: info.location,
                                    date: new Date(info.tournament_date),
                                    questionSet: info.question_set,
                                    comments: info.comments,
                                    hidden: info.hidden,
                                    pointScheme: info.tossup_point_scheme || []
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
                    let body = {
                        token,
                        location: newTournamentInfo.location,
                        name: newTournamentInfo.name,
                        date: newTournamentInfo.date,
                        questionSet: newTournamentInfo.questionSet,
                        comments: newTournamentInfo.comments,
                        hidden: newTournamentInfo.hidden
                    }
                    $http.put('/api/t/' + tournamentId, body)
                        .then(({data}) => {
                            let {name, location, hidden, comments, question_set, tournament_date} = data.result;
                            let result = {
                                name,
                                location,
                                hidden,
                                comments,
                                questionSet: question_set,
                                date: new Date(tournament_date)
                            }
                            resolve(result);
                        })
                        .catch(error => reject(error));
                })
            }
            
            return service.tournamentFactory;
            
        }]); 
        
})();