'use strict';

(function () {

    angular.module('tournamentApp').factory('Tournament', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var pointScheme = [];

        service.tournamentFactory = {
            pointScheme: pointScheme,
            getTournamentContext: getTournamentContext,
            edit: edit
        };

        function getTournamentContext(tournamentId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '?token=' + token).then(function (_ref) {
                    var data = _ref.data;

                    var info = data.data;
                    resolve({
                        tournamentInfo: {
                            name: info.name,
                            location: info.location,
                            date: new Date(info.tournament_date),
                            questionSet: info.question_set,
                            comments: info.comments,
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

        function edit(tournamentId, newTournamentInfo) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.put('/api/t/' + tournamentId + '?token=' + token).then(function (_ref2) {
                    var data = _ref2.data;

                    console.log('Done');
                    resolve(newTournamentInfo);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        return service.tournamentFactory;
    }]);
})();