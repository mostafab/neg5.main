import {query, transaction, queryTypeMap as qm, txMap as tm} from '../database/db';
import {buildMatchPhasesObject, buildMatchPlayers, buildMatchTeams, buildPlayerMatchPoints} from './../helpers/array_builders/match.builder.js';
import sql from '../database/sql';

const match = sql.match;

export default {
    
    getMatchesByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId];

            query(match.findByTournament, params, qm.any)
                .then(matches => {
                    matches.forEach(match => {
                        match.phases = match.phases.filter(phase => phase.phase_id !== null);
                    })
                    resolve(matches);
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
        })
    },

    addToTournament: (tournamentId, matchInformation, user) => {
        return new Promise((resolve, reject) => {
            let {id: matchId, moderator, notes, packet, phases, room, round, teams, tuh} = matchInformation;
            
            let queriesArray = [];
            let matchPhases = buildMatchPhasesObject(tournamentId, matchId, phases);
            let matchTeams = buildMatchTeams(tournamentId, matchId, teams);
            let matchPlayers = buildMatchPlayers(tournamentId, matchId, teams);
            let matchPlayerPoints = buildPlayerMatchPoints(tournamentId, matchId, matchPlayers.players)

            queriesArray.push(
                {
                    text: match.add.addMatch,
                    params: [matchId, tournamentId, round, room, moderator, packet, tuh, notes, user],
                    queryType: tm.one
                },
                {
                    text: match.add.addMatchPhases,
                    params: [matchPhases.phaseMatchId, matchPhases.phaseTournamentId, matchPhases.phaseId],
                    queryType: tm.any
                },
                {
                    text: match.add.addMatchTeams,
                    params: [matchTeams.teamIds, matchTeams.matchId, matchTeams.tournamentId, matchTeams.score, matchTeams.bouncebacks, matchTeams.overtime],
                    queryType: tm.many
                },
                {
                    text: match.add.addMatchPlayers,
                    params: [matchPlayers.playerIds, matchPlayers.matchIds, matchPlayers.tournamentIds, matchPlayers.tossups],
                    queryType: tm.any
                },
                {
                    text: match.add.addPlayerTossups,
                    params: [matchPlayerPoints.playerIds, matchPlayerPoints.matchIds, matchPlayerPoints.tournamentIds, matchPlayerPoints.values, matchPlayerPoints.numbers],
                    queryType: tm.any
                }
            )

            transaction(queriesArray)
                .then(result => resolve(result))
                .catch(error => reject(error));
                
        })
    }

}