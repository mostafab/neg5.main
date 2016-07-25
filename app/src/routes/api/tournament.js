import {hasToken} from '../../auth/middleware/token';
import {accessToTournament, adminAccessToTournament, directorAccessToTournament} from '../../auth/middleware/tournament-access';

import Tournament from '../../models/sql-models/tournament';

export default (app) => {
    
    
    app.route('/api/t')
        .get(hasToken, (req, res) => {
            Tournament.findByUser(req.currentUser)
                .then(data => res.json({data, success: true}))
                .catch(error => res.status(500).send({error, success: false}));    
        })
        .post(hasToken, (req, res) => {
            Tournament.create(req.body, req.currentUser)
                .then(data => res.json(data))
                .catch(error => res.status(500).send({error}));
        })
        
    app.route('/api/t/:tid')
        .get(hasToken, accessToTournament, (req, res) => {
            Tournament.findById(req.params.tid)
                .then(data => res.json({data, success: true}))
                .catch(error => res.send({error, success: false}));
        })
        .put(hasToken, adminAccessToTournament, (req, res) => {
            Tournament.update(req.params.tid, req.body)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}))
        })
        .delete((req, res) => {
            
        })
    
    app.route('/api/t/:tid/collaborator')
        .post(hasToken, (req, res) => {
            
        })
        .put(hasToken, (req, res) => {

        })

    app.route('/api/t/:tid/pointscheme')
        .post(hasToken, (req, res) => {
            Tournament.addTossupPointValue(req.params.tid, req.body)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}));
        })
        .put(hasToken, (req, res) => {
            Tournament.updateTossupPointValues(req.params.tid, req.body.pointValues)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error}))
        })
        
    app.route('/api/t/:tid/divisions')
        .get((req, res) => {
            
        })
        .post((req, res) => {
            
        })
    
}