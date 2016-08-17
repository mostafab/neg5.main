import {StatsReport} from './../../models/stats-models/report';

export default (app) => {

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

}