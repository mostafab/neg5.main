'use strict';

(function () {

    angular.module('tournamentApp').factory('Game', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var games = [];

        service.gameFactory = {
            games: games,
            postGame: postGame,
            getGames: getGames,
            deleteGame: deleteGame,
            getTeamPlayers: getTeamPlayers
        };

        function postGame(tournamentId, game) {
            var formattedGame = formatGame(game);
            return $q(function (resolve, reject) {
                var body = {
                    token: Cookies.get('nfToken'),
                    game: formattedGame
                };
                $http.post('/api/t/' + tournamentId + '/matches', body).then(function (_ref) {
                    var data = _ref.data;

                    resolve(data.result);
                }).catch(function (error) {
                    return reject(error);
                });
            });
        }

        function getGames(tournamentId) {
            var token = Cookies.get('nfToken');
            $http.get('/api/t/' + tournamentId + '/matches?token=' + token).then(function (_ref2) {
                var data = _ref2.data;

                var formattedGames = data.matches.map(function (_ref3) {
                    var id = _ref3.match_id;
                    var tuh = _ref3.tossups_heard;
                    var round = _ref3.round;
                    var team_1_id = _ref3.team_1_id;
                    var team_1_score = _ref3.team_1_score;
                    var team_2_id = _ref3.team_2_id;
                    var team_2_score = _ref3.team_2_score;
                    var phases = _ref3.phases;

                    return {
                        id: id,
                        tuh: tuh,
                        round: round,
                        teams: {
                            one: {
                                score: team_1_score,
                                id: team_1_id
                            },
                            two: {
                                score: team_2_score,
                                id: team_2_id
                            }
                        },
                        phases: phases.reduce(function (obj, current) {
                            obj[current.phase_id] = true;
                            return obj;
                        }, {})
                    };
                });
                angular.copy(formattedGames, service.gameFactory.games);
            });
        }

        function getTeamPlayers(tournamentId, teamId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/teams/' + teamId + '?token=' + token).then(function (_ref4) {
                    var data = _ref4.data;

                    var formattedPlayers = data.result.players.map(function (_ref5) {
                        var name = _ref5.player_name;
                        var id = _ref5.player_id;

                        return {
                            id: id,
                            name: name
                        };
                    });
                    resolve(formattedPlayers);
                }).catch(function (error) {
                    reject(error);
                });
            });
        }

        function deleteGame(id) {
            var index = service.gameFactory.games.map(function (team) {
                return team.id;
            }).indexOf(id);
            service.teamFactory.teams.splice(index, 1);
        }

        function formatGame(game) {
            var gameCopy = {};
            angular.copy(game, gameCopy);
            gameCopy.phases = gameCopy.phases.map(function (phase) {
                return phase.id;
            });
            gameCopy.teams = gameCopy.teams.map(function (team) {
                return {
                    id: team.teamInfo.id,
                    score: team.score,
                    bouncebacks: team.bouncebacks,
                    overtime: team.overtime,
                    players: team.players.map(function (player) {
                        return {
                            id: player.id,
                            tuh: player.tuh,
                            points: Object.keys(player.points).map(Number).map(function (pv) {
                                return {
                                    value: pv,
                                    number: player.points[pv]
                                };
                            })
                        };
                    })
                };
            });

            return gameCopy;
        }

        return service.gameFactory;
    }]);
})();