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

            function postGame() {
                
            }
            
            function getGames(tournamentId) {
                let token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/matches?token=' + token)
                    .then(({data}) => {
                        let formattedGames = data.matches.map(({shortID: id, team1, team2, tossupsheard: tuh, round}) => {
                            return {
                                id,
                                team1,
                                team2,
                                tuh,
                                round
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
            
            return service.gameFactory;
            
        }]); 
        
})();