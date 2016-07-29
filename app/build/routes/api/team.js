'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _team = require('./../../models/sql-models/team');

var _team2 = _interopRequireDefault(_team);

var _token = require('./../../auth/middleware/token');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/t/:tid/teams').get(_token.hasToken, function (req, res) {
        _team2.default.findByTournament(req.params.tid).then(function (teams) {
            return res.json({ teams: teams });
        }).catch(function (error) {
            return res.status(500).send(error);
        });
    }).post(_token.hasToken, function (req, res) {
        _team2.default.addToTournament(req.params.tid, req.body, req.currentUser).then(function (team) {
            return res.json({ team: team, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    });

    app.route('/t/:tid/teams/:teamId').get(function (req, res) {}).put(function (req, res) {}).delete(function (req, res) {});
};