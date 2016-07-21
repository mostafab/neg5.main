import {query, queryTypeMap as qm} from '../database/db';
import sql from '../database/sql';

const team = sql.team;

export default {
    
    getTeamsByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId];

            query(team.findByTournament, params, qm.any)
                .then(teams => resolve(teams))
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
        })
    }

}