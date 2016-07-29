import {query, transaction, queryTypeMap as qm, txMap as tm} from '../database/db';
import sql from '../database/sql';

const team = sql.team;

export default {
    
    getTeamsByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId];

            query(team.findByTournament, params, qm.any)
                .then(teams => resolve(teams))
                .catch(error => {
                    reject(error);
                })
        })
    },

    addTeamToTournament: (tournamentId, teamId, teamName, players, divisionIds, currentUser) => {
        return new Promise((resolve, reject) => {
            let addTeamQueries = team.add;

            let queriesArray = [];

            let {playerIds, playerNames, teamIds, tournamentIds, addedBy} = buildTeamPlayersArray(tournamentId, players, currentUser);
            let {divisionTeamIds, divisionTournamentIds} = buildTeamDivisionsArray(tournamentId, teamId, divisionIds);
            queriesArray.push(
                {
                    text: addTeamQueries.addTeam,
                    params: [teamId, teamName, tournamentId, currentUser],
                    queryType: tm.one
                },
                {
                    text: addTeamQueries.addPlayers,
                    params: [playerIds, playerNames, teamIds, tournamentIds, addedBy],
                    queryType: tm.any
                },
                {
                    text: addTeamQueries.addDivisions,
                    params: [divisionTeamIds, divisionIds, divisionTournamentIds],
                    queryType: tm.any
                }
            )

            transaction(queriesArray)
                .then(result => {
                    let formattedResult = {
                        team: result[0],
                        players: result[1],
                        divisions: result[2]
                    }
                    resolve(formattedResult);
                })
                .catch(error => reject(error));
        })
    }

}

function buildTeamPlayersArray(tournamentId, players, currentUser) {
    return {
        tournamentIds: players.map(player => tournamentId),
        playerIds: players.map(player => player.id),
        playerNames: players.map(player => player.name),
        teamIds: players.map(player => player.teamId),
        addedBy: players.map(player => currentUser)
    }
}

function buildTeamDivisionsArray(tournamentId, teamId, divisions) {
    return {
        divisionTeamIds: divisions.map(division => teamId),
        divisionTournamentIds: divisions.map(division => tournamentId)
    }
}