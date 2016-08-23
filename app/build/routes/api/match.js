'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _match = require('./../../models/sql-models/match');

var _match2 = _interopRequireDefault(_match);

var _token = require('./../../auth/middleware/token');

var _tournamentAccess = require('./../../auth/middleware/tournament-access');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/t/:tid/matches').get(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _match2.default.findByTournament(req.params.tid).then(function (matches) {
            return res.json({ matches: matches });
        }).catch(function (error) {
            return res.status(500).send(error);
        });
    }).post(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _match2.default.addToTournament(req.params.tid, req.body.game, req.currentUser).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.route('/api/t/:tid/matches/:matchId').get(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _match2.default.findById(req.params.tid, req.params.matchId).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });
};