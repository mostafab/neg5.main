'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _report = require('./../../models/stats-models/report');

exports.default = function (app) {

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
};