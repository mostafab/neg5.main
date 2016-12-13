'use strict';

(function () {

    angular.module('tournamentApp').factory('Phase', ['$http', '$q', 'Cookies', 'Tournament', function ($http, $q, Cookies, Tournament) {

        var service = this;

        var phases = [];

        var activePhase = Tournament.activePhase;

        service.phaseFactory = {
            phases: phases,

            postPhase: postPhase,
            editPhase: editPhase,
            getPhases: getPhases,
            deletePhase: deletePhase,
            updateActivePhase: updateActivePhase,

            activePhase: activePhase
        };

        function postPhase(tournamentId, phaseName) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    name: phaseName
                };
                $http.post('/api/t/' + tournamentId + '/phases', body).then(function (_ref) {
                    var data = _ref.data;

                    addNewPhaseToArray(data.result);
                    if (service.phaseFactory.phases.length === 1) {
                        updateActivePhase(tournamentId, data.result.id).then(function () {
                            return resolve(data.result.name);
                        });
                    } else {
                        resolve(data.result.name);
                    }
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function editPhase(tournamentId, newName, phaseId) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    newName: newName
                };
                $http.put('/api/t/' + tournamentId + '/phases/' + phaseId, body).then(function (_ref2) {
                    var data = _ref2.data;

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
                $http.get('/api/t/' + tournamentId + '/phases?token=' + token).then(function (_ref3) {
                    var data = _ref3.data;

                    var formattedPhases = data.result.map(function (_ref4) {
                        var name = _ref4.name;
                        var id = _ref4.id;

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

        function deletePhase(tournamentId, id) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.delete('/api/t/' + tournamentId + '/phases/' + id + '?token=' + token).then(function (_ref5) {
                    var data = _ref5.data;

                    removePhaseFromArray(data.result.id, tournamentId);
                    if (service.phaseFactory.phases.length > 0 && data.result.id === service.phaseFactory.activePhase.id) {
                        updateActivePhase(tournamentId, service.phaseFactory.phases[0].id).then(function () {
                            return resolve(data.result.name);
                        });
                    } else {
                        updateActivePhaseObject(null);
                        resolve(data.result.name);
                    }
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function updateActivePhase(tournamentId, phaseId) {
            return $q(function (resolve, reject) {
                var body = { token: Cookies.get('nfToken') };
                $http.put('/api/t/' + tournamentId + '/phases/' + phaseId + '/active', body).then(function (_ref6) {
                    var data = _ref6.data;

                    updateActivePhaseObject(data.result.active_phase_id);
                    resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function updateActivePhaseObject(phaseId) {
            var matchingPhase = service.phaseFactory.phases.find(function (phase) {
                return phase.id === phaseId;
            });
            service.phaseFactory.activePhase.id = matchingPhase ? matchingPhase.id : null;
            service.phaseFactory.activePhase.name = matchingPhase ? matchingPhase.name : null;
        }

        function updatePhaseInArray(id, newName) {
            var index = service.phaseFactory.phases.findIndex(function (phase) {
                return phase.id === id;
            });
            if (index !== -1) {
                service.phaseFactory.phases[index].name = newName;
                if (service.phaseFactory.activePhase.id === id) {
                    updateActivePhaseObject(id);
                }
            }
        }

        function addNewPhaseToArray(_ref7) {
            var name = _ref7.name;
            var id = _ref7.id;

            service.phaseFactory.phases.push({
                name: name,
                id: id,
                newName: name
            });
        }

        function removePhaseFromArray(id, tournamentId) {
            var index = service.phaseFactory.phases.findIndex(function (phase) {
                return phase.id === id;
            });
            if (index !== -1) {
                service.phaseFactory.phases.splice(index, 1);
            }
        }

        return service.phaseFactory;
    }]);
})();