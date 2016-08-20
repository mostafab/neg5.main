(() => {
   
   angular.module('tournamentApp')
        .factory('Team', ['$http', '$q', 'Cookies', 'Phase', 'Division', function($http, $q, Cookies, Phase, Division) {
            
            let service = this;
            
            let teams = [];

            let phases = Phase.phases;
            let divisions = Division.divisions;

            service.teamFactory = {
                teams,
                postTeam,
                getTeams,
                getTeamById,
                deleteTeam,
                editTeamName,
                updateTeamDivisions
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
                                newName: name,
                                id,
                                players: players.map(({player_name: name, player_id: id}) => {
                                    return {
                                        name,
                                        newName: name,
                                        id
                                    }
                                }),
                                mappedDivisions: divisions.reduce((aggr, current) => {                   
                                    aggr[current.phase_id] = current.division_id;
                                    return aggr;
                                }, {})
                            }
                            resolve(formattedTeam);
                        })
                        .catch(error => reject(error));
                })
                
            }

            function editTeamName(tournamentId, teamId, teamName) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        name: teamName
                    }
                    $http.put('/api/t/' + tournamentId + '/teams/' + teamId, body)
                        .then(({data}) => {
                            let {id, name} = data.result;
                            updateTeamNameInArray(id, name)
                            resolve(name);
                        })
                        .catch(error => reject(error));
                })
            }

            function updateTeamDivisions(tournamentId, teamId, phaseDivisionMap, divisions) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        divisions
                    }
                    $http.put('/api/t/' + tournamentId + '/teams/' + teamId + '/divisions', body)
                        .then(({data}) => {
                            updateTeamDivisionsInArray(teamId, phaseDivisionMap);
                            resolve();
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

            function updateTeamNameInArray(id, name) {
                let index = service.teamFactory.teams.findIndex(team => team.id === id);
                if (index !== -1) {
                    service.teamFactory.teams[index].name = name;
                }
            }

            function updateTeamDivisionsInArray(id, divisions) {
                let index = service.teamFactory.teams.findIndex(team => team.id === id);
                if (index !== -1) {
                    service.teamFactory.teams[index].divisions = divisions;
                }
            }

            return service.teamFactory;
            
        }]); 
        
})();