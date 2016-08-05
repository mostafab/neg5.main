import {query, transaction, queryTypeMap as qm, txMap as tm} from '../database/db';
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
    },

    addToTournament: (tournamentId, matchInformation, user) => {
        return new Promise((resolve, reject) => {
            console.log(matchInformation);
            let {id: matchId, moderator, notes, packet, phases, room, round, teams, tuh} = matchInformation;
            
            let queriesArray = [];
            let matchPhases = buildMatchPhasesObject(tournamentId, id, phases);

            queriesArray.push(
                {
                    text: match.add.addMatch,
                    params: [id, tournamentId, round, room, moderator, packet, tuh, user],
                    queryType: tm.one
                },
                {
                    text: match.add.addMatchPhases,
                    params: [matchPhases.phaseMatchId, matchPhases.phaseTournamentId, matchPhases.phaseId],
                    queryType: tm.any
                },
                {
                    text: match.add.addMatchTeams,
                    params: [],
                    queryType: tm.many
                }
            )
            resolve(matchInformation);
        })
    }

}

function buildMatchPhasesObject(tournamentId, matchId, phases) {
    return {
        phaseTournamentId: phases.map(phase => tournamentId),
        phaseMatchId: phases.map(phase => matchId),
        phaseId: phases
    }
}