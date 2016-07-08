import {hasToken} from '../../auth/middleware/token';

import Tournament from '../../models/sql-models/tournament';

export default (app) => {
    
    
    app.route('/api/t')
        .get((req, res) => {
            
        })
        .post((req, res) => {
            Tournament.create(req.body)
                .then(id => res.json({id: id}))
                .catch(error => res.json({error}));
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