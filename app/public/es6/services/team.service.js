(() => {
   
   angular.module('tournamentApp')
        .factory('Team', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            let teams = [];
            
            service.teamFactory = {
                teams,
                postTeam,
                getTeams,
                getTeamById,
                deleteTeam
            }
            
            function postTeam(tournamentId, team) {
                return $q((resolve, reject) => {
                    let formattedTeam = formatNewTeam(team);
                    let body = {
                        team: formattedTeam,
                        token: Cookies.get('nfToken')
                    }
                    $http.post('/api/t/' + tournamentId + '/teams', body)
                        .then(({data}) => {
                            getTeams(tournamentId);
                            resolve(data.team.team.name);
                        })
                        .catch(error => reject(error));
                })
            }
            
            function getTeams(tournamentId) {
                const token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/teams?token=' + token)
                    .then(({data}) => {
                        let formattedTeams = data.teams.map(({team_id: id, name: name, team_divisions = []}) => {
                            return {
                                id,
                                name,
                                divisions: team_divisions === null ? {} : team_divisions.reduce((phaseMap, current) => {
                                    phaseMap[current.phase_id] = current.division_id;
                                    return phaseMap;
                                }, {})
                            }
                        })
                        angular.copy(formattedTeams, service.teamFactory.teams);
                    })
                    .catch(error => reject(error));
            }

            function getTeamById(tournamentId, teamId) {
                return $q((resolve, reject) => {
                    const token = Cookies.get('nfToken');
                    $http.get('/api/t/' + tournamentId + '/teams/' + teamId + '?token=' + token)
                        .then(({data}) => {
                            let {name, id, players, team_divisions: divisions} = data.result;
                            let formattedTeam = {
                                name,
                                id,
                                players: players.map(({player_name: name, player_id: id}) => {
                                    return {
                                        name,
                                        id
                                    }
                                }),
                                divisions
                            }
                            resolve(formattedTeam);
                        })
                        .catch(error => reject(error));
                })
                
            }
            
            function deleteTeam(id) {
                let index = service.teamFactory.teams.map(team => team.id).indexOf(id);
                console.log(index);
                service.teamFactory.teams.splice(index, 1);
            }
            
            function formatNewTeam(team) {
                let formattedTeam = {};
                formattedTeam.players = team.players.filter(player => player.name.trim().length > 0);
                formattedTeam.name = team.name.trim();
                formattedTeam.divisions = Object.keys(team.divisions).map(phase => team.divisions[phase].id);

                return formattedTeam;
            }

            return service.teamFactory;
            
        }]); 
        
})();