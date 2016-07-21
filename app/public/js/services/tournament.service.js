'use strict';

(function () {

    angular.module('tournamentApp').factory('Tournament', ['$http', '$q', function ($http, $q) {

        var service = this;

        var pointScheme = [];

        service.tournamentFactory = {
            pointScheme: pointScheme,
            getTournamentContext: getTournamentContext
        };

        function getTournamentContext(tournamentId) {
            return $q(function (resolve, reject) {
                $http.get('/api/t/' + tournamentId).then(function (_ref) {
                    var data = _ref.data;

                    resolve({
                        tournamentInfo: {
                            name: data.name,
                            location: data.location,
                            questionSet: data.questionSet,
                            description: data.description,
                            hidden: data.hidden || true,
                            pointScheme: data.pointScheme || []
                        },
                        tournamentContext: {
                            admin: true,
                            owner: true
                        }
                    });
                }).catch(function (error) {
                    reject(error);
                });
            });
        }

        return service.tournamentFactory;
    }]);
})();