import Player from './../../models/sql-models/player';

import {hasToken} from './../../auth/middleware/token';
import {accessToTournament, adminAccessToTournament, directorAccessToTournament} from './../../auth/middleware/tournament-access';

export default (app) => {    

    app.route('/api/t/:tid/players')
        .post(hasToken, accessToTournament, (req, res) => {
            Player.addPlayer(req.params.tid, req.body.team, req.body.name, req.currentUser)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error}));
        })

    app.route('/api/t/:tid/players/:playerId')
        .put(hasToken, adminAccessToTournament, (req, res) => {
            Player.editPlayerName(req.params.tid, req.params.playerId, req.body.name)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error}));
        })
        .delete(hasToken, adminAccessToTournament, (req, res) => {
            Player.deletePlayer(req.params.tid, req.params.playerId)
                .then(result => res.json({result, success: true}))
                .catch(error => res.status(500).send({error}));
        })

}