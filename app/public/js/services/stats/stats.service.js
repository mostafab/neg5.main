'use strict';

(function () {

    angular.module('statsApp').factory('Stats', ['$http', '$q', function ($http, $q) {

        var service = this;

        service.factory = {
            refreshStats: refreshStats,

            playerStats: [],
            teamStats: [],
            teamFullStats: [],
            playerFullStats: [],

            divisions: [],

            unassignedTeams: [],

            pointScheme: [],
            tournamentName: {},

            activePhase: {}
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

                    angular.copy({ id: data.result.activePhaseId }, service.factory.activePhase);
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

                    angular.copy(data.result.divisions, service.factory.divisions);
                    angular.copy(data.result.stats, service.factory.teamStats);

                    setUnassignedTeams(data.result.stats, data.result.divisions);

                    resolve(data.result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function getTeamFullStats(tournamentId) {
            var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            return $q(function (resolve, reject) {
                $http.get('/api/t/' + tournamentId + '/stats/teamfull' + (phaseId ? '?phase=' + phaseId : '')).then(function (_ref3) {
                    var data = _ref3.data;

                    data.result.stats.forEach(function (stat) {
                        stat.matches.forEach(function (match) {
                            match.pointMap = match.tossup_totals.reduce(function (aggr, current) {
                                aggr[current.value] = current.total;
                                return aggr;
                            }, {});
                        });
                    });
                    angular.copy(data.result.stats, service.factory.teamFullStats);
                    resolve();
                });
            });
        }

        function getPlayerFullStats(tournamentId) {
            var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            return $q(function (resolve, reject) {
                $http.get('/api/t/' + tournamentId + '/stats/playerfull' + (phaseId ? '?phase=' + phaseId : '')).then(function (_ref4) {
                    var data = _ref4.data;

                    data.result.stats.forEach(function (stat) {
                        stat.matches.forEach(function (match) {
                            match.pointMap = match.tossup_totals.reduce(function (aggr, current) {
                                aggr[current.value] = current.total;
                                return aggr;
                            }, {});
                        });
                    });
                    angular.copy(data.result.stats, service.factory.playerFullStats);
                    resolve();
                });
            });
        }

        function refreshStats(tournamentId, phaseId) {
            return $q(function (resolve, reject) {

                $q.all([getPlayerStats(tournamentId, phaseId), getTeamStats(tournamentId, phaseId), getTeamFullStats(tournamentId, phaseId), getPlayerFullStats(tournamentId, phaseId)]).then(function () {
                    return resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function setUnassignedTeams(teams, divisions) {
            var toCopy = [];
            if (divisions.length > 0) {
                toCopy = teams.filter(function (team) {
                    return team.division_id === null;
                });
            }
            angular.copy(toCopy, service.factory.unassignedTeams);
        }

        return service.factory;
    }]);
})();