import shortid from 'shortid';
import {query, queryTypeMap as qm} from '../database/db';
import sql from '../database/sql';

const tournament = sql.tournament;

export default {
    
    saveTournament: (tournamentInfo) => {

        return new Promise((resolve, reject) => {
            
            const {name, date = new Date(), questionSet = '', comments = '', location = '', tossupScheme = []} = tournamentInfo;

            const tournamentId = shortid.generate();
            
            let tournamentParams = [tournamentId, name, date, questionSet, comments, location, 'mbhuiyan'];        

            let {tournamentIds, values, types} = buildTournamentPointSchemeInsertQuery(tossupScheme, tournamentId);
            
            tournamentParams.push(tournamentIds, values, types);
            console.log(tournamentParams);
            
            query(tournament.add, tournamentParams, qm.many)
                .then(result => resolve(result))
                .catch(error => reject(error));
            
        });
        
    },

    findTournamentsByUser: (username) => {

        return new Promise((resolve, reject) => {

            let params = [username];

            query(tournament.findByUser, params, qm.any)
                .then(tournaments => resolve(tournaments))
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
                
        })
    },

    findTournamentById: (id) => {
        
        return new Promise((resolve, reject) => {
            let params = [id];

            query(tournament.findById, params, qm.one)
                .then(tournament => resolve(tournament))
                .catch(error => {
                    console.log(error);
                    reject(error);
                });

        })
    },

    updateTournament: (id, newInfo) => {
        return new Promise((resolve, reject) => {    
            const {name, location = null, date = null, questionSet = null, comments = null, hidden = false} = newInfo;
            let params = [id, name, location, date, questionSet, comments, hidden];

            query(tournament.update, params, qm.one)
                .then(updatedInfo => resolve(updatedInfo))
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
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