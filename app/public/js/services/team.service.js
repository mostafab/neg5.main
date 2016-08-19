'use strict';

(function () {

    angular.module('tournamentApp').factory('Team', ['$http', '$q', 'Cookies', function ($http, $q, Cookies) {

        var service = this;

        var teams = [];

        service.teamFactory = {
            teams: teams,
            postTeam: postTeam,
            getTeams: getTeams,
            getTeamById: getTeamById,
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
            }).catch(function (error) {
                return reject(error);
            });
        }

        function getTeamById(tournamentId, teamId) {
            return $q(function (resolve, reject) {
                var token = Cookies.get('nfToken');
                $http.get('/api/t/' + tournamentId + '/teams/' + teamId + '?token=' + token).then(function (_ref4) {
                    var data = _ref4.data;
                    var _data$result = data.result;
                    var name = _data$result.name;
                    var id = _data$result.id;
                    var players = _data$result.players;
                    var divisions = _data$result.team_divisions;

                    var formattedTeam = {
                        name: name,
                        id: id,
                        players: players.map(function (_ref5) {
                            var name = _ref5.player_name;
                            var id = _ref5.player_id;

                            return {
                                name: name,
                                id: id
                            };
                        }),
                        divisions: divisions
                    };
                    resolve(formattedTeam);
                }).catch(function (error) {
                    return reject(error);
                });
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