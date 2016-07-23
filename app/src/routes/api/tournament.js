import {hasToken} from '../../auth/middleware/token';

import Tournament from '../../models/sql-models/tournament';

export default (app) => {
    
    
    app.route('/api/t')
        .get(hasToken, (req, res) => {
            Tournament.findByUser(req.currentUser)
                .then(data => res.json({data, success: true}))
                .catch(error => res.status(500).send({error, success: false}));    
        })
        .post((req, res) => {
            Tournament.create(req.body)
                .then(data => res.json(data))
                .catch(error => res.status(500).send({error}));
        })
        
    app.route('/api/t/:tid')
        .get(hasToken, (req, res) => {
            Tournament.findById(req.params.tid)
                .then(data => res.json({data, success: true}))
                .catch(error => res.send({error, success: false}));
        })
        .put(hasToken, (req, res) => {
            Tournament.update(req.params.tid, req.body)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error, success: false}))
        })
        .delete((req, res) => {
            
        })
        
    app.route('/api/t/:tid/pointscheme')
        .get((req, res) => {
            
        })
        .post((req, res) => {
            
        })
        
    app.route('/api/t/:tid/divisions')
        .get((req, res) => {
            
        })
        .post((req, res) => {
            
        })
    
}