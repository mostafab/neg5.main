import {PlayerStatsReport} from './../../models/stats-models/individual';

export default (app) => {

    app.get('/api/t/:tid/stats/player', (req, res) => {
        let report = new PlayerStatsReport(req.params.tid, req.query.phase)
        report.getReport()
            .then(result => res.json({result, success: true}))
            .catch(error => res.json({error, success: false}));
    })

}