'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _shortid = require('shortid');

var _shortid2 = _interopRequireDefault(_shortid);

var _player = require('./../../data-access/player');

var _player2 = _interopRequireDefault(_player);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {

    addPlayer: function addPlayer(tournamentId, teamId, name, currentUser) {
        return new Promise(function (resolve, reject) {
            if (!name || name.trim().length === 0) {
                return reject(new Error('Invalid player name: ' + name));
            }
            var player = { id: _shortid2.default.generate(), name: name.trim() };
            _player2.default.addTournamentPlayer(tournamentId, teamId, player, currentUser).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    editPlayerName: function editPlayerName(tournamentId, playerId, name) {
        return new Promise(function (resolve, reject) {
            if (!name || name.trim().length === 0) {
                return reject(new Error('Invalid player name: ' + name));
            }
            _player2.default.editPlayerName(tournamentId, playerId, name.trim()).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    },

    deletePlayer: function deletePlayer(tournamentId, playerId) {
        return new Promise(function (resolve, reject) {
            _player2.default.deletePlayer(tournamentId, playerId).then(function (result) {
                return resolve(result);
            }).catch(function (error) {
                return reject(error);
            });
        });
    }

};