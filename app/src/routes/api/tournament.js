import {hasToken} from '../../auth/middleware/token';

import Tournament from '../../models/sql-models/tournament';

export default (app) => {
    
    
    app.route('/api/t')
        .get(hasToken, (req, res) => {
            Tournament.findByUser(req.currentUser)
                .then(data => res.json(data))
                .catch(error => res.status(500).send(error));    
        })
        .post((req, res) => {
            Tournament.create(req.body)
                .then(data => res.json(data))
                .catch(error => res.status(500).send({error}));
        })
        
    app.route('/api/t/:tid')
        .get((req, res) => {
            res.json({name: 'Test'})
        })
        .put((req, res) => {
            
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