(() => {
   
   angular.module('TournamentApp')
        .factory('Team', ['$http', '$q', function($http, $q) {
            
            let teams = [];
            
            let teamFactory = {
                teams,
                postTeam,
                getTeams
            }
            
            function postTeam({name, divisions = [], players = []}) {
                return $q((resolve, reject) => {
                    teamFactory.teams.push({
                        name,
                        players,
                        divisions 
                    })
                    let id = Math.random();
                    resolve({id}); 
                })
            }
            
            function getTeams(tournamentId) {
                $http.get('/t/' + tournamentId + '/teams')
                    .then(({data}) => {
                        let formattedTeams = data.teams.map(({shortID: id, team_name: name, divisions = []}) => {
                            return {
                                id,
                                name,
                                divisions
                            }
                        })
                        angular.copy(formattedTeams, teamFactory.teams);
                    })
            }
           
            
            return teamFactory;
            
        }]); 
        
})();