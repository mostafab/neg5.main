'use strict';

(function () {

    angular.module('tournamentApp').factory('Division', ['$q', '$http', 'Cookies', function ($q, $http, Cookies) {

        var service = this;

        var divisions = [];

        service.factory = {
            getDivisions: getDivisions,
            editDivision: editDivision,
            addDivision: addDivision,

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

        function updateDivisionInArray(newDivisionInfo) {
            var index = service.factory.divisions.findIndex(function (division) {
                return division.id === newDivisionInfo.id;
            });
            service.factory.divisions[index].name = newDivisionInfo.name;
            service.factory.divisions[index].newName = newDivisionInfo.name;
        }

        function addDivisionToArray(_ref4) {
            var name = _ref4.name;
            var id = _ref4.id;
            var phaseId = _ref4.phase_id;

            service.factory.divisions.push({
                name: name,
                id: id,
                phaseId: phaseId
            });
        }

        return service.factory;
    }]);
})();