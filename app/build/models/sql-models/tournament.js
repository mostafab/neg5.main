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
            _tournament2.default.saveTournament(tournamentPayload).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    findByUser: function findByUser(username) {
        return new Promise(function (resolve, reject) {
            _tournament2.default.findTournamentsByUser(username).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    findById: function findById(tournamentId) {
        return new Promise(function (resolve, reject) {
            _tournament2.default.findTournamentById(tournamentId).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};