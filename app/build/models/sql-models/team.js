'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _team = require('./../../data-access/team');

var _team2 = _interopRequireDefault(_team);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    findByTournament: function findByTournament(tournamentId) {
        return new Promise(function (resolve, reject) {
            _team2.default.getTeamsByTournament(tournamentId).then(function (teams) {
                return resolve(teams);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    findById: function findById(tournamentId, teamId) {
        return new Promise(function (resolve, reject) {
            _team2.default.findById(tournamentId, teamId).then(function (team) {
                return resolve(team);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    addToTournament: function addToTournament(tournamentId, _ref, user) {
        var name = _ref.name;
        var _ref$players = _ref.players;
        var players = _ref$players === undefined ? [] : _ref$players;
        var _ref$divisions = _ref.divisions;
        var divisions = _ref$divisions === undefined ? [] : _ref$divisions;

        return new Promise(function (resolve, reject) {
            var teamId = _shortid2.default.generate();
            var formattedTeamName = name.trim();
            var formattedPlayers = players.map(function (player) {
                return {
                    teamId: teamId,
                    id: _shortid2.default.generate(),
                    name: player.name.trim()
                };
            });
            _team2.default.addTeamToTournament(tournamentId, teamId, formattedTeamName, formattedPlayers, divisions, user).then(function (team) {
                return resolve(team);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    updateName: function updateName(tournamentId, teamId, newName) {
        return new Promise(function (resolve, reject) {
            if (!newName || newName.trim().length === 0) return reject(new Error('Invalid new name: ' + newName));
            newName = newName.trim();
            _team2.default.updateTeamName(tournamentId, teamId, newName).then(function (team) {
                return resolve(team);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    updateDivisions: function updateDivisions(tournamentId, teamId, divisions) {
        return new Promise(function (resolve, reject) {
            var filteredDivisions = divisions.filter(function (division) {
                return division;
            });
            _team2.default.updateTeamDivisions(tournamentId, teamId, filteredDivisions).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    deleteTeam: function deleteTeam(tournamentId, teamId) {
        return new Promise(function (resolve, reject) {
            _team2.default.deleteTeam(tournamentId, teamId).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};