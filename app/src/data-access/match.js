import {query, queryTypeMap as qm} from '../database/db';
import sql from '../database/sql';

const match = sql.match;

export default {
    
    getMatchesByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId];

            query(match.findByTournament, params, qm.any)
                .then(matches => resolve(matches))
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
        })
    }

}