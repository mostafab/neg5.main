'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildTeamPlayersArray = buildTeamPlayersArray;
exports.buildTeamDivisionsArray = buildTeamDivisionsArray;

var _db = require('../database/db');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var team = _sql2.default.team;

exports.default = {

    getTeamsByTournament: function getTeamsByTournament(tournamentId) {
        return new Promise(function (resolve, reject) {
            var params = [tournamentId];

            (0, _db.query)(team.findByTournament, params, _db.queryTypeMap.any).then(function (teams) {
                teams.forEach(function (team) {
                    team.team_divisions = team.team_divisions.filter(function (division) {
                        return division.phase_id !== null;
                    });
                });
                resolve(teams);
            }).catch(function (error) {
                reject(error);
            });
        });
    },

    findById: function findById(tournamentId, teamId) {
        return new Promise(function (resolve, reject) {
            var params = [tournamentId, teamId];
            (0, _db.query)(team.findById, params, _db.queryTypeMap.one).then(function (team) {
                return resolve(team);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    addTeamToTournament: function addTeamToTournament(tournamentId, teamId, teamName, players, divisionIds, currentUser) {
        return new Promise(function (resolve, reject) {
            var addTeamQueries = team.add;

            var queriesArray = [];

            var _buildTeamPlayersArra = buildTeamPlayersArray(tournamentId, players, currentUser);

            var playerIds = _buildTeamPlayersArra.playerIds;
            var playerNames = _buildTeamPlayersArra.playerNames;
            var teamIds = _buildTeamPlayersArra.teamIds;
            var tournamentIds = _buildTeamPlayersArra.tournamentIds;
            var addedBy = _buildTeamPlayersArra.addedBy;

            var _buildTeamDivisionsAr = buildTeamDivisionsArray(tournamentId, teamId, divisionIds);

            var divisionTeamIds = _buildTeamDivisionsAr.divisionTeamIds;
            var divisionTournamentIds = _buildTeamDivisionsAr.divisionTournamentIds;

            queriesArray.push({
                text: addTeamQueries.addTeam,
                params: [teamId, teamName, tournamentId, currentUser],
                queryType: _db.txMap.one
            }, {
                text: addTeamQueries.addPlayers,
                params: [playerIds, playerNames, teamIds, tournamentIds, addedBy],
                queryType: _db.txMap.any
            }, {
                text: addTeamQueries.addDivisions,
                params: [divisionTeamIds, divisionIds, divisionTournamentIds],
                queryType: _db.txMap.any
            });

            (0, _db.transaction)(queriesArray).then(function (result) {
                var formattedResult = {
                    team: result[0],
                    players: result[1],
                    divisions: result[2]
                };
                resolve(formattedResult);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    updateTeamName: function updateTeamName(tournamentId, teamId, name) {
        return new Promise(function (resolve, reject) {
            var params = [tournamentId, teamId, name];
            (0, _db.query)(team.updateName, params, _db.queryTypeMap.one).then(function (team) {
                return resolve(team);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    updateTeamDivisions: function updateTeamDivisions(tournamentId, teamId, divisions) {
        return new Promise(function (resolve, reject) {
            var queriesArray = [];

            var _buildTeamDivisionsAr2 = buildTeamDivisionsArray(tournamentId, teamId, divisions);

            var divisionTeamIds = _buildTeamDivisionsAr2.divisionTeamIds;
            var divisionTournamentIds = _buildTeamDivisionsAr2.divisionTournamentIds;


            queriesArray.push({
                text: team.removeDivisions,
                params: [tournamentId, teamId],
                queryType: _db.txMap.none
            }, {
                text: team.add.addDivisions,
                params: [divisionTeamIds, divisions, divisionTournamentIds],
                queryType: _db.txMap.any
            });
            (0, _db.transaction)(queriesArray).then(function (result) {
                return resolve({ divisions: result[1] });
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    deleteTeam: function deleteTeam(tournamentId, teamId) {
        return new Promise(function (resolve, reject) {
            var params = [tournamentId, teamId];
            (0, _db.query)(team.remove, params, _db.queryTypeMap.one).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};
function buildTeamPlayersArray(tournamentId, players, currentUser) {
    return {
        tournamentIds: players.map(function (player) {
            return tournamentId;
        }),
        playerIds: players.map(function (player) {
            return player.id;
        }),
        playerNames: players.map(function (player) {
            return player.name;
        }),
        teamIds: players.map(function (player) {
            return player.teamId;
        }),
        addedBy: players.map(function (player) {
            return currentUser;
        })
    };
}

function buildTeamDivisionsArray(tournamentId, teamId, divisions) {
    return {
        divisionTeamIds: divisions.map(function (division) {
            return teamId;
        }),
        divisionTournamentIds: divisions.map(function (division) {
            return tournamentId;
        })
    };
}