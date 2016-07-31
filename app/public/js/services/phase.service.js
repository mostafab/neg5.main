'use strict';

(function () {

    angular.module('tournamentApp').factory('Phase', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var phases = [];

        service.phaseFactory = {
            phases: phases,
            postPhase: postPhase,
            getPhases: getPhases,
            deletePhase: deletePhase
        };

        function postPhase() {}

        function getPhases(tournamentId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/phases?token=' + token).then(function (_ref) {
                    var data = _ref.data;

                    var formattedPhases = data.result.map(function (_ref2) {
                        var name = _ref2.name;
                        var id = _ref2.id;

                        return {
                            name: name,
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

        return service.phaseFactory;
    }]);
})();