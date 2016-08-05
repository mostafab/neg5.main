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
                    var id = _ref3.shortID;
                    var team1 = _ref3.team1;
                    var team2 = _ref3.team2;
                    var tuh = _ref3.tossupsheard;
                    var round = _ref3.round;

                    return {
                        id: id,
                        team1: team1,
                        team2: team2,
                        tuh: tuh,
                        round: round
                    };
                });
                angular.copy(formattedGames, service.gameFactory.games);
            });
        }

        function getTeamPlayers(tournamentId, teamId) {
            return $q(function (resolve, reject) {
                $http.get('/api/t/' + tournamentId + '/teams/' + teamId).then(function (_ref4) {
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
                    players: team.players.map(function (player) {
                        return {
                            id: player.id,
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