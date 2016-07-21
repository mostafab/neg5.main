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

                var formattedPhases = data.phases.map(function (_ref2) {
                    var _ref2$active = _ref2.active;
                    var active = _ref2$active === undefined ? false : _ref2$active;
                    var name = _ref2.name;
                    var id = _ref2.phase_id;

                    return {
                        active: active,
                        name: name,
                        id: id
                    };
                });
                angular.copy(formattedPhases, service.phaseFactory.phases);
            });
        }

        function deletePhase(id) {}

        return service.phaseFactory;
    }]);
})();