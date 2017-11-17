import TeamManager from './../../managers/model-managers/team';

import {hasToken} from './../../auth/middleware/token';
import {accessToTournament, adminAccessToTournament, directorAccessToTournament} from './../../auth/middleware/tournament-access';

export default (app) => {
    
    app.route('/api/t/:tid/teams')
        .get(hasToken, accessToTournament, (req, res) => {
            TeamManager.findByTournament(req.params.tid)
                .then(teams => res.json({teams}))
                .catch(error => res.status(500).send(error));
        })
        .post(hasToken, accessToTournament, (req, res) => {
            TeamManager.addToTournament(req.params.tid, req.body.team, req.currentUser)
                .then(team => res.json({team, success: true}))
                .catch(error => res.status(500).send({error}));
        })
        
    app.route('/api/t/:tid/teams/:teamId')
        .get(hasToken, accessToTournament, (req, res) => {
            TeamManager.findById(req.params.tid, req.params.teamId)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}))
        })
        .put(hasToken, adminAccessToTournament, (req, res) => {
            TeamManager.updateName(req.params.tid, req.params.teamId, req.body.name)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}))
        })
        .delete(hasToken, adminAccessToTournament, (req, res) => {
            TeamManager.deleteTeam(req.params.tid, req.params.teamId)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}))
        })

    app.route('/api/t/:tid/teams/:teamId/divisions')
        .put(hasToken, adminAccessToTournament, (req, res) => {
            TeamManager.updateDivisions(req.params.tid, req.params.teamId, req.body.divisions)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}))
        })
    

}