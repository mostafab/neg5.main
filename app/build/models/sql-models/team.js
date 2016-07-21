'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
    }

};