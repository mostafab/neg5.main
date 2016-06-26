'use strict';

(function () {

    angular.module('TournamentApp').factory('Team', ['$http', '$q', function ($http, $q) {

        var teams = [];

        var teamFactory = {
            teams: teams,
            postTeam: postTeam,
            getTeams: getTeams,
            deleteTeam: deleteTeam
        };

        function postTeam(_ref) {
            var name = _ref.name;
            var _ref$divisions = _ref.divisions;
            var divisions = _ref$divisions === undefined ? [] : _ref$divisions;
            var _ref$players = _ref.players;
            var players = _ref$players === undefined ? [] : _ref$players;

            return $q(function (resolve, reject) {
                teamFactory.teams.push({
                    name: name,
                    players: players,
                    divisions: divisions
                });
                var id = Math.random();
                resolve({ id: id });
            });
        }

        function getTeams(tournamentId) {
            $http.get('/t/' + tournamentId + '/teams').then(function (_ref2) {
                var data = _ref2.data;

                var formattedTeams = data.teams.map(function (_ref3) {
                    var id = _ref3.shortID;
                    var name = _ref3.team_name;
                    var _ref3$divisions = _ref3.divisions;
                    var divisions = _ref3$divisions === undefined ? [] : _ref3$divisions;

                    return {
                        id: id,
                        name: name,
                        divisions: divisions
                    };
                });
                angular.copy(formattedTeams, teamFactory.teams);
            });
        }

        function deleteTeam(id) {
            var index = teamFactory.teams.map(function (team) {
                return team.id;
            }).indexOf(id);
            console.log(index);
            teamFactory.teams.splice(index, 1);
        }

        return teamFactory;
    }]);
})();