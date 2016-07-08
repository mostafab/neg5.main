'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _tournament = require('../../data-access/tournament');

var _tournament2 = _interopRequireDefault(_tournament);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    create: function create(tournamentPayload) {
        return new Promise(function (resolve, reject) {
            _tournament2.default.saveTournament(tournamentPayload).then(function (tournamentId) {
                return resolve(tournamentId);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};