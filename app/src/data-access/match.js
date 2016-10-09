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
    
    /**
     * Returns either the details for a single match or all matches depending on if detailedAll is true
     */
    findById: (tournamentId, matchId, detailedAll = false) => {
        return new Promise((resolve, reject) => {
            matchId = detailedAll ? null : matchId;
            const params = [tournamentId, matchId];
            const returnType = detailedAll ? qm.any : qm.one;
            query(match.findById, params, returnType)
                .then(match => {
                    resolve(match);
                })
                .catch(error => reject(error));
        })
    },

    addToTournament: (tournamentId, matchInformation, user, replacing = false) => {
        return new Promise((resolve, reject) => {
            let {id: matchId, moderator, notes, packet, phases, room, round, teams, tuh, scoresheet} = matchInformation;
            let queriesArray = [];
            let matchPhases = buildMatchPhasesObject(tournamentId, matchId, phases);
            let matchTeams = buildMatchTeams(tournamentId, matchId, teams);
            let matchPlayers = buildMatchPlayers(tournamentId, matchId, teams);
            let matchPlayerPoints = buildPlayerMatchPoints(tournamentId, matchId, matchPlayers.players);
            
            if (replacing) {
                queriesArray.push({
                    text: match.remove,
                    params: [tournamentId, matchId],
                    queryType: tm.one
                })
            }
            
            queriesArray.push(
                {
                    text: match.add.addMatch,
                    params: [matchId, tournamentId, round, room, moderator, packet, tuh, notes, scoresheet, user],
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
    },
    
    deleteTournamentMatch: (tournamentId, matchId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId, matchId];
            
            query(match.remove, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
                
        })
    }

}