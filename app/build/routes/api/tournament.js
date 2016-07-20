'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _token = require('../../auth/middleware/token');

var _tournament = require('../../models/sql-models/tournament');

var _tournament2 = _interopRequireDefault(_tournament);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.route('/api/t').get(_token.hasToken, function (req, res) {
        _tournament2.default.findByUser(req.currentUser).then(function (data) {
            return res.json(data);
        }).catch(function (error) {
            return res.status(500).send(error);
        });
    }).post(function (req, res) {
        _tournament2.default.create(req.body).then(function (data) {
            return res.json(data);
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    });

    app.route('/api/t/:tid').get(function (req, res) {
        res.json({ name: 'Test' });
    }).put(function (req, res) {}).delete(function (req, res) {});

    app.route('/api/t/:tid/pointscheme').get(function (req, res) {}).post(function (req, res) {});

    app.route('/api/t/:tid/divisions').get(function (req, res) {}).post(function (req, res) {});
};