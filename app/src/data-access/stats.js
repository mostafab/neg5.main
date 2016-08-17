import {query, transaction, queryTypeMap as qm, txMap as tx} from '../database/db';
import sql from '../database/sql';

let statistics = sql.statistics;
let phase = sql.phase;
let tournament = sql.tournament;
let division = sql.division;

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
                    text: phaseId ? statistics.teamGivenPhase : statistics.teamDefaultPhase,
                    params: phaseId ? [tournamentId, phaseId] : [tournamentId],
                    queryType: tx.any
                },
                {
                    text: tournament.findById,
                    params: [tournamentId],
                    queryType: tx.one
                },
                {
                    text: division.findByTournament,
                    params: [tournamentId],
                    queryType: tx.any
                }
            )

            transaction(queriesArray)
                .then(result => {
                    let formattedResult = formatStatisticsResults(result);
                    if (phaseId) {
                        formattedResult.divisions = result[3].filter(division => division.phase_id === result[0][0].id)
                    } else {
                        formattedResult.divisions = result[3].filter(division => division.phase_id === result[2].active_phase_id);
                    }
                    resolve(formattedResult);
                })  
                .catch(error => reject(error));
        })
    },

    teamFullReport: (tournamentId, phaseId = null) => {
        return new Promise((resolve, reject) => {
            let queriesArray = [];
            queriesArray.push(
                {
                    text: phase.findById,
                    params: [tournamentId, phaseId],
                    queryType: tx.any
                },
                {
                    text: statistics.teamFull,
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
                .then(result => resolve(formatStatisticsResults(result)))
                .catch(error => reject(error));
        })
    },

    playerFullReport: (tournamentId, phaseId = null) => {
        return new Promise((resolve, reject) => {
            let queriesArray = [];
            queriesArray.push(
                {
                    text: phase.findById,
                    params: [tournamentId, phaseId],
                    queryType: tx.any
                },
                {
                    text: statistics.playerFull,
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
                .then(result => resolve(formatStatisticsResults(result)))
                .catch(error => reject(error));
        })
    },

    roundReport: (tournamentId, phaseId = null) => {
        return new Promise((resolve, reject) => {
            let queriesArray = [];
            queriesArray.push(
                {
                    text: phase.findById,
                    params: [tournamentId, phaseId],
                    queryType: tx.any
                },
                {
                    text: statistics.roundReport,
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
                .then(result => resolve(formatStatisticsResults(result)))
                .catch(error => reject(error));
        })
    }
}

function formatStatisticsResults(result) {
    return {
        phase: result[0][0] || {name: 'All Phases', id: null},
        pointScheme: result[2].tossup_point_scheme.sort((first, second) => second.value - first.value),
        tournamentName: result[2].name,
        activePhaseId: result[2].active_phase_id,
        stats: result[1]                        
    }
}