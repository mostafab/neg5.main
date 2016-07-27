(() => {
   
   angular.module('tournamentApp')
        .factory('Tournament', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            let pointScheme = {
                tossupValues: []
            };
            
            service.tournamentFactory = {
                pointScheme,
                getTournamentContext,
                edit,
                addPointValue,
                postPointValues,

                setTab,
                getCurrentTab
            }

            function setTab(tab) {Cookies.set('nfCurrentTab', tab)}; 
            function getCurrentTab() {Cookies.get('nfCurrentTab')};
            
            function getTournamentContext(tournamentId) {
                return $q((resolve, reject) => {
                    const token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '?token=' + token)
                        .then(({data}) => {
                            const info = data.data;
                            let formattedPointScheme = {
                                tossupValues: info.tossup_point_scheme,
                                partsPerBonus: info.parts_per_bonus,
                                bonusPointValue: info.bonus_point_value 
                            }
                            angular.copy(formattedPointScheme, service.tournamentFactory.pointScheme);
                            resolve({
                                tournamentInfo: {
                                    name: info.name,
                                    location: info.location,
                                    date: new Date(info.tournament_date),
                                    questionSet: info.question_set,
                                    comments: info.comments,
                                    hidden: info.hidden
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

            function addPointValue(tournamentId, {type, value}) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    let body = {
                        type,
                        value   
                    }
                    $http.post('/api/t/' + tournamentId + '/pointscheme', body)
                        .then(({data}) => {
                            service.tournamentFactory.pointScheme.tossupValues.push({
                                type: data.result.tossup_answer_type,
                                value: data.result.tossup_value
                            });
                            resolve({type, value});
                        })  
                        .catch(error => reject(error));
                })
            }

            function postPointValues(tournamentId, newPointValues) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    let body = {
                        token,
                        pointValues: newPointValues
                    }
                    $http.put('/api/t/' + tournamentId + '/pointscheme', body)
                        .then(({data}) => {
                            let sortedTossupValues = data.result.tossupValues.map(({tossup_value: value, tossup_answer_type: type}) => {
                                return {
                                    value,
                                    type
                                }
                            })
                            .sort((first, second) => first.value - second.value);
                            let pointScheme = {
                                tossupValues: sortedTossupValues,
                                partsPerBonus: data.result.partsPerBonus,
                                bonusPointValue: data.result.bonusPointValue
                            }
                            angular.copy(pointScheme, service.tournamentFactory.pointScheme);
                            resolve();
                        })
                        .catch(error => reject(error));
                });
            }
            
            return service.tournamentFactory;
            
        }]); 
        
})();