'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _team = require('./../../models/sql-models/team');

var _team2 = _interopRequireDefault(_team);

var _token = require('./../../auth/middleware/token');

var _tournamentAccess = require('./../../auth/middleware/tournament-access');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/t/:tid/teams').get(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _team2.default.findByTournament(req.params.tid).then(function (teams) {
            return res.json({ teams: teams });
        }).catch(function (error) {
            return res.status(500).send(error);
        });
    }).post(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _team2.default.addToTournament(req.params.tid, req.body.team, req.currentUser).then(function (team) {
            return res.json({ team: team, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    });

    app.route('/api/t/:tid/teams/:teamId').get(_token.hasToken, _tournamentAccess.accessToTournament, function (req, res) {
        _team2.default.findById(req.params.tid, req.params.teamId).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).put(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _team2.default.updateName(req.params.tid, req.params.teamId, req.body.name).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).delete(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {});

    app.route('/api/t/:tid/teams/:teamId/divisions').put(_token.hasToken, _tournamentAccess.adminAccessToTournament, function (req, res) {
        _team2.default.updateDivisions(req.params.tid, req.params.teamId, req.body.divisions).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });
};