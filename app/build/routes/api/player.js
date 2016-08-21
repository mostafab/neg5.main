'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _player = require('./../../models/sql-models/player');

var _player2 = _interopRequireDefault(_player);

var _token = require('./../../auth/middleware/token');

var _tournamentAccess = require('./../../auth/middleware/tournament-access');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/t/:tid/players').post(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _player2.default.addPlayer(req.params.tid, req.body.team, req.body.name, req.currentUser).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    });

    app.route('/api/t/:tid/players/:playerId').put(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _player2.default.editPlayerName(req.params.tid, req.params.playerId, req.body.name).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    }).delete(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _player2.default.deletePlayer(req.params.tid, req.params.playerId).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    });
};