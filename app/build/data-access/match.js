'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require('../database/db');

var _matchBuilder = require('./../helpers/array_builders/match.builder.js');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var match = _sql2.default.match;

exports.default = {

    getMatchesByTournament: function getMatchesByTournament(tournamentId) {
        return new Promise(function (resolve, reject) {
            var params = [tournamentId];

            (0, _db.query)(match.findByTournament, params, _db.queryTypeMap.any).then(function (matches) {
                return resolve(matches);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    },

    addToTournament: function addToTournament(tournamentId, matchInformation, user) {
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


            var queriesArray = [];
            var matchPhases = (0, _matchBuilder.buildMatchPhasesObject)(tournamentId, matchId, phases);
            var matchTeams = (0, _matchBuilder.buildMatchTeams)(tournamentId, matchId, teams);
            var matchPlayers = (0, _matchBuilder.buildMatchPlayers)(tournamentId, matchId, teams);
            var matchPlayerPoints = (0, _matchBuilder.buildPlayerMatchPoints)(tournamentId, matchId, matchPlayers.players);

            queriesArray.push({
                text: match.add.addMatch,
                params: [matchId, tournamentId, round, room, moderator, packet, tuh, notes, user],
                queryType: _db.txMap.one
            }, {
                text: match.add.addMatchPhases,
                params: [matchPhases.phaseMatchId, matchPhases.phaseTournamentId, matchPhases.phaseId],
                queryType: _db.txMap.any
            }, {
                text: match.add.addMatchTeams,
                params: [matchTeams.teamIds, matchTeams.matchId, matchTeams.tournamentId, matchTeams.score, matchTeams.bouncebacks, matchTeams.overtime],
                queryType: _db.txMap.many
            }, {
                text: match.add.addMatchPlayers,
                params: [matchPlayers.playerIds, matchPlayers.matchIds, matchPlayers.tournamentIds, matchPlayers.tossups],
                queryType: _db.txMap.any
            }, {
                text: match.add.addPlayerTossups,
                params: [matchPlayerPoints.playerIds, matchPlayerPoints.matchIds, matchPlayerPoints.tournamentIds, matchPlayerPoints.values, matchPlayerPoints.numbers],
                queryType: _db.txMap.any
            });

            (0, _db.transaction)(queriesArray).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};