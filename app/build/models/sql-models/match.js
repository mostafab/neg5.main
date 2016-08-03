'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _match = require('./../../data-access/match');

var _match2 = _interopRequireDefault(_match);

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

    addToTournament: function addToTournament(tournamentId, gameInfo) {
        return new Promise(function (resolve, reject) {
            resolve(gameInfo);
        });
    }

};