'use strict';

(function () {

    angular.module('statsApp').factory('Stats', ['$http', '$q', function ($http, $q) {

        var service = this;

        service.factory = {
            refreshStats: refreshStats,

            playerStats: [],
            teamStats: [],

            pointScheme: [],
            tournamentName: {}
        };

        function getPlayerStats(tournamentId) {
            var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            return $q(function (resolve, reject) {
                $http.get('/api/t/' + tournamentId + '/stats/player' + (phaseId ? '?phase=' + phaseId : '')).then(function (_ref) {
                    var data = _ref.data;


                    data.result.stats.forEach(function (stat) {
                        stat.pointMap = stat.tossup_totals.reduce(function (aggr, current) {
                            aggr[current.value] = current.total;
                            return aggr;
                        }, {});
                    });

                    angular.copy(data.result.stats, service.factory.playerStats);
                    angular.copy(data.result.pointScheme, service.factory.pointScheme);
                    angular.copy({ name: data.result.tournamentName }, service.factory.tournamentName);

                    resolve(data.result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function getTeamStats(tournamentId) {
            var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            return $q(function (resolve, reject) {
                $http.get('/api/t/' + tournamentId + '/stats/team' + (phaseId ? '?phase=' + phaseId : '')).then(function (_ref2) {
                    var data = _ref2.data;

                    data.result.stats.forEach(function (stat) {
                        stat.pointMap = stat.tossup_totals.reduce(function (aggr, current) {
                            aggr[current.value] = current.total;
                            return aggr;
                        }, {});
                    });

                    angular.copy(data.result.stats, service.factory.teamStats);

                    resolve(data.result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function refreshStats(tournamentId, phaseId) {
            return $q(function (resolve, reject) {

                $q.all([getPlayerStats(tournamentId, phaseId), getTeamStats(tournamentId, phaseId)]).then(function () {
                    return resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        return service.factory;
    }]);
})();