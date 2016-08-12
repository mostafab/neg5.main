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

        function postTeam(tournamentId, team) {
            return $q(function (resolve, reject) {
                var formattedTeam = formatNewTeam(team);
                var body = {
                    team: formattedTeam,
                    token: Cookies.get('nfToken')
                };
                $http.post('/api/t/' + tournamentId + '/teams', body).then(function (_ref) {
                    var data = _ref.data;

                    getTeams(tournamentId);
                    resolve(data.team.team.name);
                }).catch(function (error) {
                    return reject(error);
                });
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
                        divisions: team_divisions === null ? {} : team_divisions.reduce(function (phaseMap, current) {
                            phaseMap[current.phase_id] = current.division_id;
                            return phaseMap;
                        }, {})
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

        function formatNewTeam(team) {
            var formattedTeam = {};
            formattedTeam.players = team.players.filter(function (player) {
                return player.name.trim().length > 0;
            });
            formattedTeam.name = team.name.trim();
            formattedTeam.divisions = Object.keys(team.divisions).map(function (phase) {
                return team.divisions[phase].id;
            });

            return formattedTeam;
        }

        return service.teamFactory;
    }]);
})();