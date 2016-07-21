'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require('../database/db');

var _sql = require('../database/sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var team = _sql2.default.team;

exports.default = {

    getTeamsByTournament: function getTeamsByTournament(tournamentId) {
        return new Promise(function (resolve, reject) {
            var params = [tournamentId];

            (0, _db.query)(team.findByTournament, params, _db.queryTypeMap.any).then(function (teams) {
                return resolve(teams);
            }).catch(function (error) {
                console.log(error);
                reject(error);
            });
        });
    }

};