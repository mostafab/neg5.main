(() => {
   
   angular.module('tournamentApp')
        .factory('Collaborator', ['$http', '$q', 'Cookies', function($http, $q, Cookies) {
            
            let service = this;
            
            let collaborators = [];
            
            service.collaboratorFactory = {
                collaborators,
                getCollaborators,
                deleteCollaborator,
                postCollaborator,
                updateCollaborator,
                findUsers
            }
            
            function postCollaborator(tournamentId, username, isAdmin) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    let body = {
                        username,
                        token,
                        admin: isAdmin
                    }
                    $http.post('/api/t/' + tournamentId + '/collaborators', body)
                        .then(({data}) => {
                            let formattedResult = {
                                name: data.result.name,
                                username: data.result.username,
                                admin: data.result.is_admin
                            };
                            service.collaboratorFactory.collaborators.push(formattedResult);
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        })
                })
            }
            
            function getCollaborators(tournamentId) {
                let token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/collaborators?token=' + token)
                    .then(({data}) => {
                        let formattedCollaborators = data.result.map(({name, username, is_admin: admin}) => {
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
            
            function updateCollaborator(tournamentId, username, admin) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    let body = {
                        admin,
                        token
                    }
                    $http.put('/api/t/' + tournamentId + '/collaborators/' + username, body)
                        .then(({data}) => {
                            service.collaboratorFactory.collaborators.find(collab => collab.username === data.result.username).admin = data.result.is_admin;
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        })
                })
                
            }

            function findUsers(search) {
                return $q((resolve, reject) => {
                    let token = Cookies.get('nfToken');
                    $http({
                        url: '/api/users?token=' + token + '&search=' + search,
                        method: 'GET'
                    })
                    .then(({data}) => {
                        let formattedResults = data.users.filter(user => user.username !== data.currentUser);
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