'use strict';

(function () {

    angular.module('tournamentApp').factory('Phase', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var phases = [];

        service.phaseFactory = {
            phases: phases,
            postPhase: postPhase,
            editPhase: editPhase,
            getPhases: getPhases,
            deletePhase: deletePhase
        };

        function postPhase() {}

        function editPhase(tournamentId, newName, phaseId) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    newName: newName
                };
                $http.put('/api/t/' + tournamentId + '/phases/' + phaseId, body).then(function (_ref) {
                    var data = _ref.data;

                    updatePhaseInArray(data.result.id, data.result.name);
                    resolve(data.result.name);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function getPhases(tournamentId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/phases?token=' + token).then(function (_ref2) {
                    var data = _ref2.data;

                    var formattedPhases = data.result.map(function (_ref3) {
                        var name = _ref3.name;
                        var id = _ref3.id;

                        return {
                            name: name,
                            newName: name,
                            id: id
                        };
                    });
                    angular.copy(formattedPhases, service.phaseFactory.phases);
                    resolve(formattedPhases);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function deletePhase(id) {}

        function updatePhaseInArray(id, newName) {
            var index = service.phaseFactory.phases.findIndex(function (phase) {
                return phase.id === id;
            });
            if (index !== -1) {
                service.phaseFactory.phases[index].name = newName;
            }
        }

        return service.phaseFactory;
    }]);
})();