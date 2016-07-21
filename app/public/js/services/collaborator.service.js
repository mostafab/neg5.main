'use strict';

(function () {

    angular.module('tournamentApp').factory('Collaborator', ['$http', '$q', function ($http, $q) {

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

        function findUsers(searchQuery) {
            return $q(function (resolve, reject) {
                $http({
                    url: '/api/users',
                    method: 'GET',
                    params: {
                        searchQuery: searchQuery
                    }
                }).then(function (_ref3) {
                    var data = _ref3.data;

                    var formattedResults = data.directors.map(function (_ref4) {
                        var username = _ref4.email;
                        var name = _ref4.name;

                        return {
                            username: username,
                            name: name
                        };
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