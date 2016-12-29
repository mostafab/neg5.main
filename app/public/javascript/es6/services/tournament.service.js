(() => {
   
   angular.module('tournamentApp')
        .factory('Tournament', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            let pointScheme = {
                tossupValues: []
            };

            let activePhase = {};

            let rules = {
                bouncebacks: false,
                maxActive: 4
            }
            
            service.tournamentFactory = {
                rules,

                activePhase,

                pointScheme,
                getTournamentContext,
                edit,
                addPointValue,
                postPointValues,

                updateRules
            }
            
            function getTournamentContext(tournamentId) {
                return $q((resolve, reject) => {
                    const token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '?token=' + token)
                        .then(({data}) => {
                            const info = data.data.tournament;
                            const permissions = data.data.permissions;

                            let formattedPointScheme = {
                                tossupValues: info.tossup_point_scheme,
                                partsPerBonus: info.parts_per_bonus,
                                bonusPointValue: info.bonus_point_value 
                            }
                            let formattedRules = {
                                bouncebacks: info.bouncebacks,
                                maxActive: info.max_active_players_per_team
                            }
                            let formattedActivePhase = {
                                id: info.active_phase_id,
                                name: info.active_phase_name
                            }

                            angular.copy(formattedActivePhase, service.tournamentFactory.activePhase);
                            angular.copy(formattedRules, service.tournamentFactory.rules);
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
                                    admin: permissions.is_owner || permissions.is_admin,
                                    owner: permissions.is_owner || false
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

            function updateRules(tournamentId, {bouncebacks, maxActive}) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    let body = {
                        token,
                        rules: {
                            bouncebacks,
                            maxActive
                        }
                    }
                    $http.put('/api/t/' + tournamentId + '/rules', body)
                        .then(({data}) => {
                            let formattedRules = {
                                bouncebacks: data.result.bouncebacks,
                                maxActive: data.result.max_active_players_per_team
                            }
                            angular.copy(formattedRules, service.tournamentFactory.rules);
                            resolve(service.tournamentFactory.rules);
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