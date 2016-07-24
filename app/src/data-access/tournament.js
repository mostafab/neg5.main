import {query, queryTypeMap as qm} from '../database/db';
import sql from '../database/sql';

const tournament = sql.tournament;

export default {
    
    saveTournament: (tournamentInfo) => {

        return new Promise((resolve, reject) => {
            
            const {id, name, date, questionSet, comments, location, tossupScheme, username} = tournamentInfo;
            
            let tournamentParams = [id, name, date, questionSet, comments, location, username];        

            let {tournamentIds, values, types} = buildTournamentPointSchemeInsertQuery(tossupScheme, id);
            
            tournamentParams.push(tournamentIds, values, types);
            
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
                .then(tournament => {
                    tournament.tossup_point_scheme = tournament.tossup_point_scheme.filter(tv => {
                        return tv.type !== null;
                    }).sort((first, second) => {
                        return first.value - second.value;
                    });
                    resolve(tournament)
                })
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
    },

    addTossupPointValue: (id, {type, value}) => {
        return new Promise((resolve, reject) => {
            let params = [id, type, value];

            query(tournament.addPointValue, params, qm.one)
                .then(newTossupValue => resolve(newTossupValue))
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
        })
    },

    updateTossupPointValues: (id, tossupPointValues) => {
        return new Promise((resolve, reject) => {
            let params = [id];
            let {tournamentIds, values, types} = buildTournamentPointSchemeInsertQuery(tossupPointValues, id);

            params.push(tournamentIds, values, types);

            query(tournament.updatePointValues, params, qm.any)
                .then(newTossupValues => resolve(newTossupValues))
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