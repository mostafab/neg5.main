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
                        let formattedTeams = data.teams.map(({id: id, name: name, divisions = []}) => {
                            return {
                                id,
                                name,
                                divisions
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