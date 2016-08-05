'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require('../database/db');

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
            console.log(matchInformation);
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
            var matchPhases = buildMatchPhasesObject(tournamentId, id, phases);

            queriesArray.push({
                text: match.add.addMatch,
                params: [id, tournamentId, round, room, moderator, packet, tuh, user],
                queryType: _db.txMap.one
            }, {
                text: match.add.addMatchPhases,
                params: [matchPhases.phaseMatchId, matchPhases.phaseTournamentId, matchPhases.phaseId],
                queryType: _db.txMap.any
            }, {
                text: match.add.addMatchTeams,
                params: [],
                queryType: _db.txMap.many
            });
            resolve(matchInformation);
        });
    }

};


function buildMatchPhasesObject(tournamentId, matchId, phases) {
    return {
        phaseTournamentId: phases.map(function (phase) {
            return tournamentId;
        }),
        phaseMatchId: phases.map(function (phase) {
            return matchId;
        }),
        phaseId: phases
    };
}