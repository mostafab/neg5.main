(() => {
   
   angular.module('tournamentApp')
        .factory('Collaborator', ['$http', '$q', function($http, $q) {
            
            let service = this;
            
            let collaborators = [];
            
            service.collaboratorFactory = {
                collaborators,
                getCollaborators,
                deleteCollaborator,
                findUsers
            }
            
            function postCollaborator(tournamentId) {
                
            }
            
            function getCollaborators(tournamentId) {
                $http.get('/api/t/' + tournamentId + '/collaborators')
                    .then(({data}) => {
                        let formattedCollaborators = data.collaborators.map(({name, email: username, admin}) => {
                            return {
                                name,
                                username,
                                admin
                            }
                        })
                        angular.copy(formattedCollaborators, service.collaboratorFactory.collaborators);
                    })
                    .catch(error => console.log(error));
            }
            
            function findUsers(searchQuery) {
                return $q((resolve, reject) => {
                    $http({
                        url: '/api/users',
                        method: 'GET',
                        params: {
                            searchQuery
                        }
                    })
                    .then(({data}) => {
                        let formattedResults = data.directors.map(({email: username, name}) => {
                            return {
                                username,
                                name
                            }
                        });
                        resolve({users: formattedResults});
                    })
                    .catch(error => reject(error));
                })               
            }
            
            function deleteCollaborator(tournamentId, username) {
                let index = 0;
                while (service.collaboratorFactory.collaborators[index] && service.collaboratorFactory.collaborators[index].username !== username) {
                    index++;
                }
                service.collaboratorFactory.collaborators.splice(index, 1);
            }
            
            return service.collaboratorFactory;
            
        }]); 
        
})();