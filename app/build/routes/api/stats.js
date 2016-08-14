'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _individual = require('./../../models/stats-models/individual');

exports.default = function (app) {

    app.get('/api/t/:tid/stats/player', function (req, res) {
        var report = new _individual.PlayerStatsReport(req.params.tid, req.query.phase);
        report.getReport().then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.json({ error: error, success: false });
        });
    });
};