(() => {
   
   angular.module('tournamentApp')
        .factory('Game', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            let games = [];
            
            service.gameFactory = {
                games,
                postGame,
                getGames,
                deleteGame,
                getTeamPlayers,
                getGameById,
                editGame
            }

            function postGame(tournamentId, game) {
                let formattedGame = formatGame(game);
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        game: formattedGame
                    }
                    $http.post('/api/t/' + tournamentId + '/matches', body)
                        .then(({data}) => {
                            resolve(data.result);
                        })
                        .catch(error => reject(error));
                })
            }
            
            function getGames(tournamentId) {
                let token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/matches?token=' + token)
                    .then(({data}) => {
                        let formattedGames = data.matches.map(({match_id: id, 
                                tossups_heard: tuh, round, team_1_id, team_1_score, team_2_id, team_2_score, 
                                team_1_name, team_2_name,
                                phases}) => {
                            return {
                                id,
                                tuh,
                                round,
                                teams: {
                                    one: {
                                        score: team_1_score,
                                        id: team_1_id,
                                        name: team_1_name
                                    },
                                    two: {
                                        score: team_2_score,
                                        id: team_2_id,
                                        name: team_2_name
                                    }
                                },
                                phases: phases.reduce((obj, current) => {
                                    obj[current.phase_id] = true;
                                    return obj;
                                }, {})
                            }
                        });
                        angular.copy(formattedGames, service.gameFactory.games);
                    })
            }
            
            function getTeamPlayers(tournamentId, teamId) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                   $http.get('/api/t/' + tournamentId + '/teams/' + teamId + '?token=' + token)
                        .then(({data}) => {
                            let formattedPlayers = data.result.players.map(({player_name: name, player_id: id}) => {
                                return {
                                    id,
                                    name
                                }
                            })
                            resolve(formattedPlayers);
                        })
                        .catch(error => {
                            reject(error);
                        }) 
                })
                
            }
            
            function getGameById(tournamentId, gameId) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '/matches/' + gameId + '?token=' + token)
                        .then(({data}) => {
                            let game = data.result;
                            let formattedGame = {
                                addedBy: game.added_by,
                                id: game.match_id,
                                tuh: game.tossups_heard,
                                moderator: game.moderator,
                                notes: game.notes,
                                packet: game.packet,
                                room: game.room,
                                round: game.round,
                                teams: game.teams.map(team => {
                                    return {
                                        id: team.team_id,
                                        name: team.team_name,
                                        overtime: team.overtime_tossups,
                                        bouncebacks: team.bounceback_points,
                                        score: team.score,
                                        players: team.players.map(player => {
                                            return {
                                                id: player.player_id,
                                                name: player.player_name,
                                                tuh: player.tossups_heard,
                                                points: player.tossup_values.reduce((aggr, current) => {
                                                    aggr[current.value] = current.number;
                                                    return aggr;
                                                }, {})
                                            }
                                        })
                                    }
                                }),
                                phases: game.phases.map(phase => {
                                    return {
                                        id: phase.phase_id,
                                        name: phase.phase_name
                                    }
                                })
                            }
                            resolve(formattedGame);
                        })
                        .catch(error => reject(error));
                })
            }
            
            function editGame(tournamentId, gameId, gameInformation) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        game: formatGame(gameInformation)
                    }
                    $http.put('/api/t/' + tournamentId + '/matches/' + gameId, body)
                        .then(({data}) => {
                            let game = data.result;
                            resolve(game);
                        })
                        .catch(error => reject(error));
                })
            }

            function deleteGame(tournamentId, matchId) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http.delete('/api/t/' + tournamentId + '/matches/' + matchId + '?token=' + token)
                        .then(({data}) => {
                            let matchId = data.result.id;
                            removeMatchFromArray(matchId);
                            
                            resolve();
                            
                        })
                        .catch(error => reject(error));
                })
            }

            function formatGame(game) {
                let gameCopy = {};
                angular.copy(game, gameCopy);
                gameCopy.phases = gameCopy.phases.map(phase => phase.id);
                gameCopy.teams = gameCopy.teams.map(team => {
                    return {
                        id: team.teamInfo.id,
                        score: team.score,
                        bouncebacks: team.bouncebacks,
                        overtime: team.overtime,
                        players: team.players.map(player => {
                            return {
                                id: player.id,
                                tuh: player.tuh || 0,
                                points: Object.keys(player.points)
                                    .map(Number).map(pv => {
                                        return {
                                            value: pv,
                                            number: player.points[pv] || 0
                                        }
                                    })
                            }
                        })
                    }
                })
                
                return gameCopy;
            }
            
            function removeMatchFromArray(matchId) {
                let index = service.gameFactory.games.findIndex(game => game.id === matchId);
                if (index !== -1) {
                    service.gameFactory.games.splice(index, 1);      
                }
            }
            
            return service.gameFactory;
            
        }]); 
        
})();