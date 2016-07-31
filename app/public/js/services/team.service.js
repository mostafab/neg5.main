'use strict';

(function () {

    angular.module('tournamentApp').factory('Team', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var teams = [];

        service.teamFactory = {
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
                service.teamFactory.teams.push({
                    name: name,
                    players: players,
                    divisions: divisions
                });
                var id = Math.random();
                resolve({ id: id });
            });
        }

        function getTeams(tournamentId) {
            var token = Cookies.get('nfToken');
            $http.get('/api/t/' + tournamentId + '/teams?token=' + token).then(function (_ref2) {
                var data = _ref2.data;

                var formattedTeams = data.teams.map(function (_ref3) {
                    var id = _ref3.team_id;
                    var name = _ref3.name;
                    var _ref3$team_divisions = _ref3.team_divisions;
                    var team_divisions = _ref3$team_divisions === undefined ? [] : _ref3$team_divisions;

                    return {
                        id: id,
                        name: name,
                        divisions: team_divisions === null ? [] : team_divisions.map(function (d) {
                            return {
                                name: d.division_name,
                                id: d.division_id,
                                phaseName: d.phase_name,
                                phaseId: d.phase_id
                            };
                        })
                    };
                });
                angular.copy(formattedTeams, service.teamFactory.teams);
            });
        }

        function deleteTeam(id) {
            var index = service.teamFactory.teams.map(function (team) {
                return team.id;
            }).indexOf(id);
            console.log(index);
            service.teamFactory.teams.splice(index, 1);
        }

        return service.teamFactory;
    }]);
})();