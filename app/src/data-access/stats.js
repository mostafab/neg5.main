import {query, transaction, queryTypeMap as qm, txMap as tx} from '../database/db';
import sql from '../database/sql';

let statistics = sql.statistics;
let phase = sql.phase;
let tournament = sql.tournament;

export default {

    individualReport: (tournamentId, phaseId = null) => {
        return new Promise((resolve, reject) => {
            let queriesArray = [];

            queriesArray.push(
                {
                    text: phase.findById,
                    params: [tournamentId, phaseId],
                    queryType: tx.any
                },
                {
                    text: statistics.individual,
                    params: [tournamentId, phaseId],
                    queryType: tx.any
                },
                {
                    text: tournament.findById,
                    params: [tournamentId],
                    queryType: tx.one
                }
            )

            transaction(queriesArray)
                .then(result => {
                    let formattedResult = formatStatisticsResults(result);
                    resolve(formattedResult);
                })
                .catch(error => reject(error));
                
        })
    },

    teamReport: (tournamentId, phaseId = null) => {
        return new Promise((resolve, reject) => {
            let queriesArray = [];

            queriesArray.push(
                {
                    text: phase.findById,
                    params: [tournamentId, phaseId],
                    queryType: tx.any
                },
                {
                    text: statistics.team,
                    params: [tournamentId, phaseId],
                    queryType: tx.any
                },
                {
                    text: tournament.findById,
                    params: [tournamentId],
                    queryType: tx.one
                }
            )

            transaction(queriesArray)
                .then(result => {
                    let formattedResult = formatStatisticsResults(result);
                    resolve(formattedResult);
                })  
                .catch(error => reject(error));
        })
    }
}

function formatStatisticsResults(result) {
    return {
        phase: result[0][0] || {name: 'All Phases', id: null},
        pointScheme: result[2].tossup_point_scheme.sort((first, second) => second.value - first.value),
        tournamentName: result[2].name,
        stats: result[1]                        
    }
}