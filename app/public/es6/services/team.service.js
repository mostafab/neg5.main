(() => {
   
   angular.module('tournamentApp')
        .factory('Team', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            let teams = [];
            
            service.teamFactory = {
                teams,
                postTeam,
                getTeams,
                deleteTeam
            }
            
            function postTeam({name, divisions = [], players = []}) {
                return $q((resolve, reject) => {
                    service.teamFactory.teams.push({
                        name,
                        players,
                        divisions 
                    });
                    let id = Math.random();
                    resolve({id}); 
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
                                divisions: team_divisions === null ? [] : team_divisions.map(d => {
                                    return {
                                        name: d.division_name,
                                        id: d.division_id,
                                        phaseName: d.phase_name,
                                        phaseId: d.phase_id
                                    }
                                })
                            }
                        })
                        angular.copy(formattedTeams, service.teamFactory.teams);
                    })
            }
            
            function deleteTeam(id) {
                let index = service.teamFactory.teams.map(team => team.id).indexOf(id);
                console.log(index);
                service.teamFactory.teams.splice(index, 1);
            }
            
            return service.teamFactory;
            
        }]); 
        
})();