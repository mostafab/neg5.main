'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _report = require('./../../models/stats-models/report');

var _qbj = require('./../../models/stats-models/qbj');

var _qbj2 = _interopRequireDefault(_qbj);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.get('/t/:tid/stats', function (req, res) {
        res.render('stats/stats-home');
    });

    app.get('/api/t/:tid/stats/player', function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getIndividualReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).json({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/stats/team', function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getTeamReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/stats/teamfull', function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getTeamFullReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/stats/playerfull', function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getPlayerFullReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/stats/roundreport', function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getRoundReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/qbj', function (req, res) {
        var schema = _qbj2.default.createQBJObject(req.params.tid);
        res.setHeader('content-type', 'application/vnd.quizbowl.qbj+json');
        res.send({ result: schema });
    });
};