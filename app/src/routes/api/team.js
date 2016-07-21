import Team from './../../models/sql-models/team';

import {hasToken} from './../../auth/middleware/token';

export default (app) => {
    
    app.route('/api/t/:tid/teams')
        .get(hasToken, (req, res) => {
            Team.findByTournament(req.params.tid)
                .then(teams => res.json({teams}))
                .catch(error => res.status(500).send(error));
        })
        .post((req, res) => {
            
        })
        
    app.route('/t/:tid/teams/:teamId')
        .get((req, res) => {
            
        })
        .put((req, res) => {
            
        })
        .delete((req, res) => {
            
        })
    
}