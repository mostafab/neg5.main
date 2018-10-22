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

import StatReportType from './../../enums/stat-report-type';

export default (app) => {

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