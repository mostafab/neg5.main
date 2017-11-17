import {StatsReport} from './../../managers/stats-models/report';
import QbjManager from './../../managers/stats-models/qbj';
import MatchManager from './../../managers/model-managers/match';

import {hasToken} from './../../auth/middleware/token';
import {accessToTournament} from './../../auth/middleware/tournament-access';

import TeamStandingsHtml from './../../html-stats/team-standings';
import PlayerStandingsHtml from './../../html-stats/player-standings';
import TeamFullStandingsHtml from './../../html-stats/team-full';
import PlayerFullStandingsHtml from './../../html-stats/player-full';
import RoundReportHtml from './../../html-stats/round-report';

import { checkStatsCache, addStatsToCache } from './../../cache/middleware/check-stats-cache';
import statsConstants from './../../cache/constants';

export default (app) => {
    
    app.get('/api/t/:tid/stats/player', checkStatsCache(statsConstants.INDIVIDUAL_STANDINGS), (req, res) => {
        let report = new StatsReport(req.params.tid)
        report.getIndividualReport(req.query.phase || null)
            .then(result => {
                addStatsToCache(req, statsConstants.INDIVIDUAL_STANDINGS, result)
                res.json({result, success: true})
            })
            .catch(error => res.status(500).json({error, success: false}));
    })

    app.get('/api/t/:tid/stats/team', checkStatsCache(statsConstants.TEAM_STANDINGS), (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getTeamReport(req.query.phase || null)
            .then(result => {
                addStatsToCache(req, statsConstants.TEAM_STANDINGS, result);
                res.json({result, success: true})
            })
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/teamfull', checkStatsCache(statsConstants.TEAM_FULL_STANDINGS), (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getTeamFullReport(req.query.phase || null)
            .then(result => {
                addStatsToCache(req, statsConstants.TEAM_FULL_STANDINGS, result);
                res.json({result, success: true})
            })
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/playerfull', checkStatsCache(statsConstants.INDIVIDUAL_FULL), (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getPlayerFullReport(req.query.phase || null)
            .then(result => {
                addStatsToCache(req, statsConstants.INDIVIDUAL_FULL, result);
                res.json({result, success: true});
            })
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/roundreport', checkStatsCache(statsConstants.ROUND_REPORT), (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getRoundReport(req.query.phase || null)
            .then(result => {
                addStatsToCache(req, statsConstants.ROUND_REPORT, result);
                res.json({result, success: true})
            })
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/qbj', (req, res) => {
        QbjManager.createQBJObject(req.params.tid)
            .then(qbj => {
                res.setHeader('content-type', 'application/vnd.quizbowl.qbj+json')
                res.send({ ...qbj });        
            })
            .catch(error => res.status(500).send({error, success: false}));
    })
    
    app.get('/api/t/:tid/scoresheets', hasToken, accessToTournament, (req, res) => {
        MatchManager.getScoresheets(req.params.tid)
            .then(result => res.json({result, success: true}))
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