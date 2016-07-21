import Match from './../../models/sql-models/match';

import {hasToken} from './../../auth/middleware/token';

export default (app) => {

    app.route('/api/t/:tid/matches')
        .get(hasToken, (req, res) => {
            Match.findByTournament(req.params.tid)
                .then(matches => res.json({matches}))
                .catch(error => res.status(500).send(error));
        })
        .post((req, res) => {
            
        })
    
}