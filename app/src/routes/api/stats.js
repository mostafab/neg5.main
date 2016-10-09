import {StatsReport} from './../../models/stats-models/report';
import Qbj from './../../models/stats-models/qbj';

import {hasToken} from './../../auth/middleware/token';
import {accessToTournament} from './../../auth/middleware/tournament-access';

export default (app) => {
    
    app.get('/t/:tid/stats', (req, res) => {
        res.render('stats/stats-home');
    })
    
    app.get('/api/t/:tid/stats/player', (req, res) => {
        let report = new StatsReport(req.params.tid)
        report.getIndividualReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).json({error, success: false}));
    })

    app.get('/api/t/:tid/stats/team', (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getTeamReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/teamfull', (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getTeamFullReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/playerfull', (req, res) => {
        let report = new StatsReport(req.params.tid);
        report.getPlayerFullReport(req.query.phase || null)
            .then(result => res.json({result, success: true}))
            .catch(error => res.status(500).send({error, success: false}))
    })

    app.get('/api/t/:tid/stats/roundreport', (req, res) => {
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