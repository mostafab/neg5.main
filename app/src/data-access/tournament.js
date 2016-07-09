import shortid from 'shortid';
import {query, queryTypeMap as qm} from '../database/db';
import sql from '../database/sql';

const tournament = sql.tournament;

export default {
    
    saveTournament: (tournamentInfo) => {

        return new Promise((resolve, reject) => {
            
            const {name, date = new Date(), questionSet = '', comments = '', tossupScheme = []} = tournamentInfo;
        
            const tournamentId = shortid.generate();
            
            let tournamentParams = [tournamentId, name, date, questionSet, comments, 'mbadmin'];        

            let {tournamentIds, values, types} = buildTournamentPointSchemeInsertQuery(tossupScheme, tournamentId);
            
            tournamentParams.push(tournamentIds, values, types);

            query(tournament.add, tournamentParams, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
            
        });
        
    },

    findTournamentsByUser: (username) => {

        return new Promise((resolve, reject) => {

            let query = `SELECT T.id, T.name, T.director_id, U.is_admin, CASE WHEN T.director_id=$1 THEN true ELSE false END AS is_owner FROM tournament T LEFT JOIN user_collaborates_on_tournament U ON T.id=U.tournament_id
                        WHERE T.director_id=$1 OR U.username=$1`;

            let params = [username];

             promiseQuery(query, params, qm.many)
                .then(tournaments => resolve(tournaments))
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
        })
    }
    
}

function buildTournamentPointSchemeInsertQuery(rows, tournamentId) {

    let tournamentIds = rows.map(row => tournamentId);
    let values = rows.map(row => row.value);
    let types = rows.map(row => row.type);

    return {
        tournamentIds,
        values,
        types
    };
}