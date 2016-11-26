'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _match = require('./../../data-access/match');

var _match2 = _interopRequireDefault(_match);

var _team = require('./team');

var _team2 = _interopRequireDefault(_team);

var _playerUtil = require('./../../helpers/player-util');

var _playerUtil2 = _interopRequireDefault(_playerUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    findByTournament: function findByTournament(tournamentId) {
        return new Promise(function (resolve, reject) {
            _match2.default.getMatchesByTournament(tournamentId).then(function (games) {
                return resolve(games);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    findById: function findById(tournamentId, matchId) {
        return new Promise(function (resolve, reject) {
            _match2.default.findById(tournamentId, matchId).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    addToTournament: function addToTournament(tournamentId, gameInfo, user) {
        var matchId = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

        return new Promise(function (resolve, reject) {
            var _gameInfo$scoresheet = gameInfo.scoresheet;
            var scoresheet = _gameInfo$scoresheet === undefined ? null : _gameInfo$scoresheet;
            var _gameInfo$moderator = gameInfo.moderator;
            var moderator = _gameInfo$moderator === undefined ? null : _gameInfo$moderator;
            var _gameInfo$notes = gameInfo.notes;
            var notes = _gameInfo$notes === undefined ? null : _gameInfo$notes;
            var _gameInfo$packet = gameInfo.packet;
            var packet = _gameInfo$packet === undefined ? null : _gameInfo$packet;
            var phases = gameInfo.phases;
            var _gameInfo$room = gameInfo.room;
            var room = _gameInfo$room === undefined ? null : _gameInfo$room;
            var _gameInfo$round = gameInfo.round;
            var round = _gameInfo$round === undefined ? 0 : _gameInfo$round;
            var teams = gameInfo.teams;
            var _gameInfo$tuh = gameInfo.tuh;
            var tuh = _gameInfo$tuh === undefined ? 20 : _gameInfo$tuh;


            if (!phases || !teams || phases.length === 0) return reject(new Error('Phases and teams are both required'));

            var matchInfo = match({
                id: matchId,
                moderator: moderator,
                notes: notes,
                packet: packet,
                phases: phases,
                room: room,
                round: round,
                teams: teams,
                tuh: tuh,
                scoresheet: scoresheet
            });

            _match2.default.addToTournament(tournamentId, matchInfo, user, matchId ? true : false).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    deleteMatch: function deleteMatch(tournamentId, gameId) {
        return new Promise(function (resolve, reject) {
            _match2.default.deleteTournamentMatch(tournamentId, gameId).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    getScoresheets: function getScoresheets(tournamentId) {
        return new Promise(function (resolve, reject) {
            var teamsPromise = _team2.default.findByTournament(tournamentId);
            var matchesPromise = _match2.default.getMatchesByTournament(tournamentId);
            Promise.all([teamsPromise, matchesPromise]).then(function (result) {
                var allPlayers = _playerUtil2.default.buildPlayerListFromTeams(result[0]);
                var playerMap = _playerUtil2.default.buildPlayerMap(allPlayers);
                resolve(result[1]);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};


function match(_ref) {
    var _ref$id = _ref.id;
    var id = _ref$id === undefined ? _shortid2.default.generate() : _ref$id;
    var moderator = _ref.moderator;
    var notes = _ref.notes;
    var packet = _ref.packet;
    var phases = _ref.phases;
    var room = _ref.room;
    var round = _ref.round;
    var teams = _ref.teams;
    var tuh = _ref.tuh;
    var scoresheet = _ref.scoresheet;

    return {
        id: id,
        moderator: moderator === null ? null : moderator.trim(),
        notes: notes === null ? null : notes.trim(),
        packet: packet === null ? null : packet.trim(),
        phases: phases,
        room: room === null ? null : room.trim(),
        round: round,
        teams: teams,
        tuh: tuh,
        scoresheet: scoresheet
    };
}