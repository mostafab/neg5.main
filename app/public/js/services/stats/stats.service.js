'use strict';

(function () {

    angular.module('statsApp').factory('Stats', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        service.factory = {
            refreshStats: refreshStats,
            getQBJReport: getQBJReport,

            playerStats: [],
            teamStats: [],
            teamFullStats: [],
            playerFullStats: [],
            roundReportStats: [],

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
                }).catch(function (error) {
                    return reject(error);
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
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function getRoundReport(tournamentId) {
            var phaseId = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            return $q(function (resolve, reject) {
                $http.get('/api/t/' + tournamentId + '/stats/roundreport' + (phaseId ? '?phase=' + phaseId : '')).then(function (_ref5) {
                    var data = _ref5.data;

                    angular.copy(data.result.stats, service.factory.roundReportStats);
                    resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function getQBJReport(tournamentId, _ref6) {
            var _ref6$download = _ref6.download;
            var download = _ref6$download === undefined ? false : _ref6$download;
            var _ref6$fileName = _ref6.fileName;
            var fileName = _ref6$fileName === undefined ? 'qbj_file' : _ref6$fileName;

            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/qbj?token=' + token).then(function (_ref7) {
                    var data = _ref7.data;

                    if (download) {
                        downloadQBJ(data.result, fileName);
                    }
                    resolve();
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function refreshStats(tournamentId, phaseId) {
            return $q(function (resolve, reject) {

                $q.all([getPlayerStats(tournamentId, phaseId), getTeamStats(tournamentId, phaseId), getTeamFullStats(tournamentId, phaseId), getPlayerFullStats(tournamentId, phaseId), getRoundReport(tournamentId, phaseId)]).then(function () {
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

        function downloadQBJ(json, fileName) {
            if (window.navigator.msSaveOrOpenBlob) {
                var fileData = [JSON.stringify(json, null, 4)];
                var blobObject = new Blob(fileData);
                window.navigator.msSaveOrOpenBlob(blobObject, fileName + '.qbj');
            } else {
                var tempAnchor;

                (function () {
                    var type = 'json';
                    var blob = new Blob([JSON.stringify(json, null, 4)], { type: type });
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);
                    tempAnchor = document.createElement("a");


                    if (typeof tempAnchor.download === 'undefined') {
                        window.location = downloadUrl;
                    } else {
                        tempAnchor.href = downloadUrl;
                        tempAnchor.download = fileName + '.qbj';
                        document.body.appendChild(tempAnchor);
                        tempAnchor.click();
                        setTimeout(function () {
                            document.body.removeChild(tempAnchor);
                            window.URL.revokeObjectURL(downloadUrl);
                        }, 100);
                    }
                })();
            }
        }

        return service.factory;
    }]);
})();