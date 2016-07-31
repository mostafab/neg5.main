'use strict';

(function () {

    angular.module('tournamentApp').factory('Division', ['$q', '$http', 'Cookies', function ($q, $http, Cookies) {

        var service = this;

        var divisions = [];

        service.factory = {
            getDivisions: getDivisions,
            editDivision: editDivision,
            addDivision: addDivision,
            removeDivision: removeDivision,

            divisions: divisions
        };

        function getDivisions(tournamentId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/divisions?token=' + token).then(function (_ref) {
                    var data = _ref.data;

                    var formattedDivisions = data.result.map(function (division) {
                        return {
                            name: division.division_name,
                            newName: division.division_name,
                            id: division.division_id,
                            phaseId: division.phase_id
                        };
                    });
                    angular.copy(formattedDivisions, service.factory.divisions);
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            });
        }

        function editDivision(tournamentId, division) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    newName: division.newName
                };
                $http.put('/api/t/' + tournamentId + '/divisions/' + division.id, body).then(function (_ref2) {
                    var data = _ref2.data;

                    updateDivisionInArray(data.result);
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            });
        }

        function addDivision(tournamentId, name, phaseId) {
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    name: name,
                    phaseId: phaseId
                };
                $http.post('/api/t/' + tournamentId + '/divisions', body).then(function (_ref3) {
                    var data = _ref3.data;

                    addDivisionToArray(data.result);
                    resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function removeDivision(tournamentId, _ref4) {
            var id = _ref4.id;

            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.delete('/api/t/' + tournamentId + '/divisions/' + id + '?token=' + token).then(function (_ref5) {
                    var data = _ref5.data;

                    removeDivisionFromArray(data.result.id);
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            });
        }

        function updateDivisionInArray(newDivisionInfo) {
            var index = service.factory.divisions.findIndex(function (division) {
                return division.id === newDivisionInfo.id;
            });
            service.factory.divisions[index].name = newDivisionInfo.name;
            service.factory.divisions[index].newName = newDivisionInfo.name;
        }

        function addDivisionToArray(_ref6) {
            var name = _ref6.name;
            var id = _ref6.id;
            var phaseId = _ref6.phase_id;

            service.factory.divisions.push({
                name: name,
                newName: name,
                id: id,
                phaseId: phaseId
            });
        }

        function removeDivisionFromArray(divisionId) {
            var index = service.factory.divisions.findIndex(function (division) {
                return division.id === divisionId;
            });
            if (index !== -1) {
                service.factory.divisions.splice(index, 1);
            }
        }

        return service.factory;
    }]);
})();