'use strict';

(function () {

    angular.module('tournamentApp').factory('Game', ['$http', '$q', function ($http, $q) {

        var service = this;

        var games = [];

        service.gameFactory = {
            games: games,
            postGame: postGame,
            getGames: getGames,
            deleteGame: deleteGame
        };

        function postGame() {}

        function getGames(tournamentId) {
            $http.get('/t/' + tournamentId + '/games').then(function (_ref) {
                var data = _ref.data;

                var formattedGames = data.games.map(function (_ref2) {
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

        function deleteGame(id) {
            var index = service.gameFactory.games.map(function (team) {
                return team.id;
            }).indexOf(id);
            service.teamFactory.teams.splice(index, 1);
        }

        return service.gameFactory;
    }]);
})();