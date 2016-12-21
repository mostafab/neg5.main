'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _db = require('../database/db');

var _match = require('./../helpers/array_builders/match.builder');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var matchSQL = _sql2.default.match;

exports.default = {
  getMatchesByTournament: function getMatchesByTournament(tournamentId) {
    return new Promise(function (resolve, reject) {
      var params = [tournamentId];
      (0, _db.query)(matchSQL.findByTournament, params, _db.queryTypeMap.any).then(function (matches) {
        return resolve(matches.map(function (m) {
          return _extends({}, m, {
            phases: m.phases.filter(function (p) {
              return p.phase_id !== null;
            })
          });
        }));
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  /**
   * Returns either the details for a single match or
   * all matches depending on if detailedAll is true
   */
  findById: function findById(tournamentId, matchId) {
    var detailedAll = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    return new Promise(function (resolve, reject) {
      var params = [tournamentId, detailedAll ? null : matchId];
      var returnType = detailedAll ? _db.queryTypeMap.any : _db.queryTypeMap.one;
      (0, _db.query)(matchSQL.findById, params, returnType).then(function (foundMatch) {
        return resolve(foundMatch);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  addToTournament: function addToTournament(tournamentId, matchInformation, user) {
    var replacing = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
    return new Promise(function (resolve, reject) {
      var matchId = matchInformation.id;
      var moderator = matchInformation.moderator;
      var notes = matchInformation.notes;
      var packet = matchInformation.packet;
      var phases = matchInformation.phases;
      var room = matchInformation.room;
      var round = matchInformation.round;
      var teams = matchInformation.teams;
      var tuh = matchInformation.tuh;
      var scoresheet = matchInformation.scoresheet;

      var queriesArray = [];
      var matchPhases = (0, _match.buildMatchPhasesObject)(tournamentId, matchId, phases);
      var matchTeams = (0, _match.buildMatchTeams)(tournamentId, matchId, teams);
      var matchPlayers = (0, _match.buildMatchPlayers)(tournamentId, matchId, teams);
      var matchPlayerPoints = (0, _match.buildPlayerMatchPoints)(tournamentId, matchId, matchPlayers.players);

      if (replacing) {
        queriesArray.push({
          text: matchSQL.remove,
          params: [tournamentId, matchId],
          queryType: _db.txMap.one
        });
      }

      queriesArray.push({
        text: matchSQL.add.addMatch,
        params: [matchId, tournamentId, round, room, moderator, packet, tuh, notes, scoresheet, user],
        queryType: _db.txMap.one
      }, {
        text: matchSQL.add.addMatchPhases,
        params: [matchPhases.phaseMatchId, matchPhases.phaseTournamentId, matchPhases.phaseId],
        queryType: _db.txMap.any
      }, {
        text: matchSQL.add.addMatchTeams,
        params: [matchTeams.teamIds, matchTeams.matchId, matchTeams.tournamentId, matchTeams.score, matchTeams.bouncebacks, matchTeams.overtime],
        queryType: _db.txMap.many
      }, {
        text: matchSQL.add.addMatchPlayers,
        params: [matchPlayers.playerIds, matchPlayers.matchIds, matchPlayers.tournamentIds, matchPlayers.tossups],
        queryType: _db.txMap.any
      }, {
        text: matchSQL.add.addPlayerTossups,
        params: [matchPlayerPoints.playerIds, matchPlayerPoints.matchIds, matchPlayerPoints.tournamentIds, matchPlayerPoints.values, matchPlayerPoints.numbers],
        queryType: _db.txMap.any
      });

      (0, _db.transaction)(queriesArray).then(function (result) {
        return resolve(result);
      }).catch(function (error) {
        return reject(error);
      });
    });
  },

  deleteTournamentMatch: function deleteTournamentMatch(tournamentId, matchId) {
    return new Promise(function (resolve, reject) {
      var params = [tournamentId, matchId];
      (0, _db.query)(matchSQL.remove, params, _db.queryTypeMap.one).then(function (result) {
        return resolve(result);
      }).catch(function (error) {
        return reject(error);
      });
    });
  }

};