'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _match = require('./../../models/sql-models/match');

var _match2 = _interopRequireDefault(_match);

var _token = require('./../../auth/middleware/token');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/t/:tid/matches').get(_token.hasToken, function (req, res) {
        _match2.default.findByTournament(req.params.tid).then(function (matches) {
            return res.json({ matches: matches });
        }).catch(function (error) {
            return res.status(500).send(error);
        });
    }).post(function (req, res) {});
};