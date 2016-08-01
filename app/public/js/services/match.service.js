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

        function postGame() {}

        function getGames(tournamentId) {
            var token = Cookies.get('nfToken');
            $http.get('/api/t/' + tournamentId + '/matches?token=' + token).then(function (_ref) {
                var data = _ref.data;

                var formattedGames = data.matches.map(function (_ref2) {
                    var id = _ref2.shortID;
                    var team1 = _ref2.team1;
                    var team2 = _ref2.team2;
                    var tuh = _ref2.tossupsheard;
                    var round = _ref2.round;

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
                $http.get('/api/t/' + tournamentId + '/teams/' + teamId).then(function (_ref3) {
                    var data = _ref3.data;

                    var formattedPlayers = data.result.players.map(function (_ref4) {
                        var name = _ref4.player_name;
                        var id = _ref4.player_id;

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

        return service.gameFactory;
    }]);
})();