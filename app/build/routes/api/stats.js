'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _report = require('./../../models/stats-models/report');

var _qbj = require('./../../models/stats-models/qbj');

var _qbj2 = _interopRequireDefault(_qbj);

var _match = require('./../../models/sql-models/match');

var _match2 = _interopRequireDefault(_match);

var _token = require('./../../auth/middleware/token');

var _tournamentAccess = require('./../../auth/middleware/tournament-access');

var _teamStandings = require('./../../html-stats/team-standings');

var _teamStandings2 = _interopRequireDefault(_teamStandings);

var _playerStandings = require('./../../html-stats/player-standings');

var _playerStandings2 = _interopRequireDefault(_playerStandings);

var _teamFull = require('./../../html-stats/team-full');

var _teamFull2 = _interopRequireDefault(_teamFull);

var _playerFull = require('./../../html-stats/player-full');

var _playerFull2 = _interopRequireDefault(_playerFull);

var _roundReport = require('./../../html-stats/round-report');

var _roundReport2 = _interopRequireDefault(_roundReport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app) {

    app.get('/t/:tid/stats', function (req, res) {
        res.render('stats/stats-home');
    });

    app.get('/api/t/:tid/stats/player', requestedStatsHtml, function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getIndividualReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).json({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/stats/team', requestedStatsHtml, function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getTeamReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/stats/teamfull', requestedStatsHtml, function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getTeamFullReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/stats/playerfull', requestedStatsHtml, function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getPlayerFullReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/stats/roundreport', requestedStatsHtml, function (req, res) {
        var report = new _report.StatsReport(req.params.tid);
        report.getRoundReport(req.query.phase || null).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/qbj', function (req, res) {
        _qbj2.default.createQBJObject(req.params.tid, req.currentUser).then(function (qbj) {
            res.setHeader('content-type', 'application/vnd.quizbowl.qbj+json');
            res.send({ result: qbj, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });

    app.get('/api/t/:tid/scoresheets', function (req, res) {
        _match2.default.getScoresheets(req.params.tid).then(function (result) {
            return res.json({ result: result, success: true });
        }).catch(function (error) {
            return res.status(500).send({ error: error, success: false });
        });
    });
};

function requestedStatsHtml(req, res, next) {
    var html = req.query.html;

    if (html !== '1') {
        return next();
    }
    var reportType = getTypeOfReportFromUrl(req.url);
    var htmlGeneratorMethod = chooseMethodToGenerateHtml(req);

    htmlGeneratorMethod(req.params.tid, req.query.phase).then(function (html) {
        res.setHeader('content-type', 'text/html');
        res.send(html);
    }).catch(function (error) {
        return res.status(500).send({ error: error, success: false });
    });
}

function getTypeOfReportFromUrl(url) {
    return url.split('/')[5].split('?')[0];
}

function chooseMethodToGenerateHtml(request) {
    var reportType = getTypeOfReportFromUrl(request.url);
    var htmlGeneratorMethod = void 0;
    switch (reportType) {
        case 'player':
            htmlGeneratorMethod = _playerStandings2.default;
            break;
        case 'team':
            htmlGeneratorMethod = _teamStandings2.default;
            break;
        case 'teamfull':
            htmlGeneratorMethod = _teamFull2.default;
            break;
        case 'playerfull':
            htmlGeneratorMethod = _playerFull2.default;
            break;
        case 'roundreport':
            htmlGeneratorMethod = _roundReport2.default;
            break;
        default:
            break;
    }

    return htmlGeneratorMethod;
}