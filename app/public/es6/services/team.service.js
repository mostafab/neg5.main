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
                editTeamPlayerName,
                updateTeamDivisions,
                addPlayer,
                deletePlayer
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
                            let {name, id, players, team_divisions: divisions, added_by: addedBy} = data.result;
                            let formattedTeam = {
                                name,
                                newName: name,
                                id,
                                players: players.map(({player_name: name, player_id: id, added_by: addedBy, games}) => {
                                    return {
                                        name,
                                        newName: name,
                                        id,
                                        addedBy,
                                        games
                                    }
                                }),
                                mappedDivisions: divisions.reduce((aggr, current) => {                   
                                    aggr[current.phase_id] = current.division_id;
                                    return aggr;
                                }, {}),
                                addedBy
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

            function editTeamPlayerName(tournamentId, playerId, name) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        name
                    }
                    $http.put('/api/t/' + tournamentId + '/players/' + playerId, body)
                        .then(({data}) => {
                            resolve(data.result.name);
                        })
                        .catch(error => reject(error));
                })
            }

            function addPlayer(tournamentId, teamId, newPlayerName) {
                return $q((resolve, reject) => {
                    let body = {
                        token: Cookies.get('nfToken'),
                        name: newPlayerName,
                        team: teamId
                    }
                    $http.post('/api/t/' + tournamentId + '/players', body)
                        .then(({data}) => resolve(data.result))
                        .catch(error => reject(error));
                })
            }

            function deletePlayer(tournamentId, playerId) {
                return $q((resolve, reject) => {
                    const token = Cookies.get('nfToken');
                    $http.delete('/api/t/' + tournamentId + '/players/' + playerId + '?token=' + token)
                        .then(({data}) => resolve(data.result.id))
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