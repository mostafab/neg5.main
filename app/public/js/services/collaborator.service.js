'use strict';

(function () {

    angular.module('tournamentApp').factory('Collaborator', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var collaborators = [];

        service.collaboratorFactory = {
            collaborators: collaborators,
            getCollaborators: getCollaborators,
            deleteCollaborator: deleteCollaborator,
            postCollaborator: postCollaborator,
            updateCollaborator: updateCollaborator,
            findUsers: findUsers
        };

        function postCollaborator(tournamentId, username, isAdmin) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                var body = {
                    username: username,
                    token: token,
                    admin: isAdmin
                };
                $http.post('/api/t/' + tournamentId + '/collaborators', body).then(function (_ref) {
                    var data = _ref.data;

                    var formattedResult = {
                        name: data.result.name,
                        username: data.result.username,
                        admin: data.result.is_admin
                    };
                    service.collaboratorFactory.collaborators.push(formattedResult);
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            });
        }

        function getCollaborators(tournamentId) {
            var token = Cookies.get('nfToken');
            $http.get('/api/t/' + tournamentId + '/collaborators?token=' + token).then(function (_ref2) {
                var data = _ref2.data;

                var formattedCollaborators = data.result.map(function (_ref3) {
                    var name = _ref3.name;
                    var username = _ref3.username;
                    var admin = _ref3.is_admin;

                    return {
                        name: name,
                        username: username,
                        admin: admin
                    };
                });
                angular.copy(formattedCollaborators, service.collaboratorFactory.collaborators);
            }).catch(function (error) {
                return console.log(error);
            });
        }

        function updateCollaborator(tournamentId, username, admin) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                var body = {
                    admin: admin,
                    token: token
                };
                $http.put('/api/t/' + tournamentId + '/collaborators/' + username, body).then(function (_ref4) {
                    var data = _ref4.data;

                    service.collaboratorFactory.collaborators.find(function (collab) {
                        return collab.username === data.result.username;
                    }).admin = data.result.is_admin;
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            });
        }

        function findUsers(search) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http({
                    url: '/api/users?token=' + token + '&search=' + search,
                    method: 'GET'
                }).then(function (_ref5) {
                    var data = _ref5.data;

                    var formattedResults = data.users.filter(function (user) {
                        return user.username !== data.currentUser;
                    });
                    resolve({ users: formattedResults });
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function deleteCollaborator(tournamentId, username) {
            var index = 0;
            while (service.collaboratorFactory.collaborators[index] && service.collaboratorFactory.collaborators[index].username !== username) {
                index++;
            }
            service.collaboratorFactory.collaborators.splice(index, 1);
        }

        return service.collaboratorFactory;
    }]);
})();