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
                getTeamPlayers
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
                        let formattedGames = data.matches.map(({match_id: id, tossups_heard: tuh, round, team_1_id, team_1_score, team_2_id, team_2_score, phases}) => {
                            return {
                                id,
                                tuh,
                                round,
                                teams: {
                                    one: {
                                        score: team_1_score,
                                        id: team_1_id
                                    },
                                    two: {
                                        score: team_2_score,
                                        id: team_2_id
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
                   $http.get('/api/t/' + tournamentId + '/teams/' + teamId)
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
            
            function deleteGame(id) {
                let index = service.gameFactory.games.map(team => team.id).indexOf(id);
                service.teamFactory.teams.splice(index, 1);
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
                                tuh: player.tuh,
                                points: Object.keys(player.points)
                                    .map(Number).map(pv => {
                                        return {
                                            value: pv,
                                            number: player.points[pv]
                                        }
                                    })
                            }
                        })
                    }
                })
                
                return gameCopy;
            }
            
            return service.gameFactory;
            
        }]); 
        
})();