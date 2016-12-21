'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _db = require('../database/db');

var _team = require('./team');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var playerSQL = _sql2.default.player;
var teamSQL = _sql2.default.team;

exports.default = {

  addTournamentPlayer: function addTournamentPlayer(tournamentId, teamId, _ref, currentUser) {
    var id = _ref.id;
    var name = _ref.name;
    return new Promise(function (resolve, reject) {
      var playersArray = [{ id: id, teamId: teamId, name: name }];

      var _buildTeamPlayersArra = (0, _team.buildTeamPlayersArray)(tournamentId, playersArray, currentUser);

      var tournamentIds = _buildTeamPlayersArra.tournamentIds;
      var playerIds = _buildTeamPlayersArra.playerIds;
      var playerNames = _buildTeamPlayersArra.playerNames;
      var teamIds = _buildTeamPlayersArra.teamIds;
      var addedBy = _buildTeamPlayersArra.addedBy;

      var params = [playerIds, playerNames, teamIds, tournamentIds, addedBy];
      (0, _db.query)(teamSQL.add.addPlayers, params, _db.queryTypeMap.one).then(function (result) {
        return resolve(result);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  editPlayerName: function editPlayerName(tournamentId, playerId, name) {
    return new Promise(function (resolve, reject) {
      var params = [tournamentId, playerId, name];
      (0, _db.query)(playerSQL.edit, params, _db.queryTypeMap.one).then(function (result) {
        return resolve(result);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  deletePlayer: function deletePlayer(tournamentId, playerId) {
    return new Promise(function (resolve, reject) {
      var params = [tournamentId, playerId];
      (0, _db.query)(playerSQL.remove, params, _db.queryTypeMap.one).then(function (result) {
        return resolve(result);
      }).catch(function (error) {
        return reject(error);
      });
    });
  }

};