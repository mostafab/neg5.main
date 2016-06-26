'use strict';

(function () {

    angular.module('tournamentApp').factory('Phase', ['$http', '$q', function ($http, $q) {

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
            $http.get('/t/' + tournamentId + '/phases').then(function (_ref) {
                var data = _ref.data;

                angular.copy(data.phases, service.phaseFactory.phases);
            });
        }

        function deletePhase(id) {}

        return service.gameFactory;
    }]);
})();