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
            return res.json({ data: data, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).post(function (req, res) {
        _tournament2.default.create(req.body).then(function (data) {
            return res.json(data);
        }).catch(function (error) {
            return res.status(500).send({ error: error });
        });
    });

    app.route('/api/t/:tid').get(_token.hasToken, function (req, res) {
        _tournament2.default.findById(req.params.tid).then(function (data) {
            return res.json({ data: data, success: true });
        }).catch(function (error) {
            return res.send({ error: error, success: false });
        });
    }).put(_token.hasToken, function (req, res) {
        _tournament2.default.update(req.params.tid, req.body).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    }).delete(function (req, res) {});

    app.route('/api/t/:tid/pointscheme').get(function (req, res) {}).post(function (req, res) {});

    app.route('/api/t/:tid/divisions').get(function (req, res) {}).post(function (req, res) {});
};