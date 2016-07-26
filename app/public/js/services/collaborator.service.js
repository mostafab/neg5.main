'use strict';

(function () {

    angular.module('tournamentApp').factory('Collaborator', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var collaborators = [];

        service.collaboratorFactory = {
            collaborators: collaborators,
            getCollaborators: getCollaborators,
            deleteCollaborator: deleteCollaborator,
            findUsers: findUsers
        };

        function postCollaborator(tournamentId) {}

        function getCollaborators(tournamentId) {
            $http.get('/api/t/' + tournamentId + '/collaborators').then(function (_ref) {
                var data = _ref.data;

                var formattedCollaborators = data.collaborators.map(function (_ref2) {
                    var name = _ref2.name;
                    var username = _ref2.email;
                    var admin = _ref2.admin;

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

        function findUsers(search) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http({
                    url: '/api/users?token=' + token + '&search=' + search,
                    method: 'GET'
                }).then(function (_ref3) {
                    var data = _ref3.data;

                    var formattedResults = data.users.filter(function (user) {
                        return user.username !== data.currentUser;
                    });
                    console.log(formattedResults);
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