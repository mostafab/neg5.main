import {StatsReport} from './../../models/stats-models/report';
import Qbj from './../../models/stats-models/qbj';

import {hasToken} from './../../auth/middleware/token';
import {accessToTournament} from './../../auth/middleware/tournament-access';

import TeamStandingsHtml from './../../html-stats/team-standings';
import PlayerStandingsHtml from './../../html-stats/player-standings';
import TeamFullStandingsHtml from './../../html-stats/team-full';
import PlayerFullStandingsHtml from './../../html-stats/player-full';
import RoundReportHtml from './../../html-stats/round-report';

export default (app) => {
    
    app.get('/t/:tid/stats', (req, res) => {
        res.render('stats/stats-home');
    })
    
    app.get('/api/t/:tid/stats/player', requestedStatsHtml, (req, res) => {
        let report = new StatsReport(req.params.tid)
        report.getIndividualReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).json({error, success: false}));
    })

    app.get('/api/t/:tid/stats/team', requestedStatsHtml, (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getTeamReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/teamfull', requestedStatsHtml, (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getTeamFullReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/playerfull', requestedStatsHtml, (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getPlayerFullReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/roundreport', requestedStatsHtml, (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getRoundReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/qbj', hasToken, accessToTournament, (req, res) => {
        Qbj.createQBJObject(req.params.tid, req.currentUser)
            .then(qbj => {
                res.setHeader('content-type', 'application/vnd.quizbowl.qbj+json')
                res.send({result: qbj, success: true});        
            })
            .catch(error => res.status(500).send({error, success: false}));
    })

}

function requestedStatsHtml(req, res, next) {
    const {html} = req.query;
    if (html !== '1') {
        return next();
    }
    const reportType = getTypeOfReportFromUrl(req.url);
    let htmlGeneratorMethod = chooseMethodToGenerateHtml(req);
    
    htmlGeneratorMethod(req.params.tid, req.query.phase)
        .then(html => {
            res.setHeader('content-type', 'text/html');
            res.send(html);
        })
        .catch(error => res.status(500).send({error, success: false}))
}

function getTypeOfReportFromUrl(url) {
    return url.split('/')[5].split('?')[0];
}

function chooseMethodToGenerateHtml(request) {
    const reportType = getTypeOfReportFromUrl(request.url);
    let htmlGeneratorMethod;
    switch (reportType) {
        case 'player':
            htmlGeneratorMethod = PlayerStandingsHtml;
            break;
        case 'team':
            htmlGeneratorMethod = TeamStandingsHtml;
            break;
        case 'teamfull':
            htmlGeneratorMethod = TeamFullStandingsHtml;
            break;
        case 'playerfull':
            htmlGeneratorMethod = PlayerFullStandingsHtml;
            break;
        case 'roundreport':
            htmlGeneratorMethod = RoundReportHtml;
            break;
        default:
            break;
    }
    
    return htmlGeneratorMethod;
}