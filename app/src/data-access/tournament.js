import shortid from 'shortid';

import {promiseQuery, transaction, queryTypeMap as qm} from '../database/db';

export default {
    
    saveTournament: (tournamentInfo) => {

        return new Promise((resolve, reject) => {
            
            const {name, date = new Date(), questionSet = '', comments = '', tossupScheme = []} = tournamentInfo;
        
            const tournamentId = shortid.generate();
            
            let tournamentQuery = `INSERT INTO tournament (id, name, tournament_date, question_set, comments, director_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            let tournamentParams = [tournamentId, name, date, questionSet, comments, 'mbadmin'];        
            
            let {tossupParams, values: tossupValues} = buildTournamentPointSchemeInsertQuery(tossupScheme, tournamentId);
            
            let tossupQuery = `INSERT INTO tournament_tossup_values (tournament_id, tossup_value, tossup_answer_type) VALUES ${tossupValues.join(', ')} RETURNING *`;             

            transaction([
                {
                    query: tournamentQuery,
                    params: tournamentParams,
                    queryType: qm.one
                },
                {
                    query: tossupQuery,
                    params: tossupParams,
                    queryType: qm.many
                }
            ])
            .then(data => {
                let result = {
                    tournament: data[0],
                    points: data[1]
                }
                resolve(result);
            })
            .catch(error => {
                console.log(error);
                reject(error)
            });
            
        });
        
    } 
    
}

function buildTournamentPointSchemeInsertQuery(rows, tournamentId) {
    let tossupParams = [];
    let values = [];
    
    rows.forEach(row => {
        let currentRowValues = [];
        
        tossupParams.push(tournamentId);
        currentRowValues.push('$' + tossupParams.length);
        
        tossupParams.push(row.value);
        currentRowValues.push('$' + tossupParams.length);
        
        tossupParams.push(row.type);
        currentRowValues.push('$' + tossupParams.length);
        
        values.push('(' + currentRowValues.join(', ') + ')');
    });
    
    return {
        tossupParams,
        values
    }
}