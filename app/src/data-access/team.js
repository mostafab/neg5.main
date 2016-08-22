import {query, transaction, queryTypeMap as qm, txMap as tm} from '../database/db';
import sql from '../database/sql';

const team = sql.team;

export default {
    
    getTeamsByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId];

            query(team.findByTournament, params, qm.any)
                .then(teams => {
                    teams.forEach(team => {
                        team.team_divisions = team.team_divisions.filter(division => division.phase_id !== null);
                    })
                    resolve(teams);
                })
                .catch(error => {
                    reject(error);
                })
        })
    },

    findById: (tournamentId, teamId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId, teamId];
            query(team.findById, params, qm.one)
                .then(team => resolve(team))
                .catch(error => reject(error));
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
    },

    updateTeamName: (tournamentId, teamId, name) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId, teamId, name];
            query(team.updateName, params, qm.one)
                .then(team => resolve(team))
                .catch(error => reject(error));
        })
    },

    updateTeamDivisions: (tournamentId, teamId, divisions) => {
        return new Promise((resolve, reject) => {
            let queriesArray = [];

            let {divisionTeamIds, divisionTournamentIds} = buildTeamDivisionsArray(tournamentId, teamId, divisions);

            queriesArray.push(
                {
                    text: team.removeDivisions,
                    params: [tournamentId, teamId],
                    queryType: tm.none
                },
                {
                    text: team.add.addDivisions,
                    params: [divisionTeamIds, divisions, divisionTournamentIds],
                    queryType: tm.any
                }
            )
            transaction(queriesArray)
                .then(result => resolve({divisions: result[1]}))
                .catch(error => reject(error));
        })
    },

    deleteTeam: (tournamentId, teamId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId, teamId];
            query(team.remove, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

}

export function buildTeamPlayersArray(tournamentId, players, currentUser) {
    return {
        tournamentIds: players.map(player => tournamentId),
        playerIds: players.map(player => player.id),
        playerNames: players.map(player => player.name),
        teamIds: players.map(player => player.teamId),
        addedBy: players.map(player => currentUser)
    }
}

export function buildTeamDivisionsArray(tournamentId, teamId, divisions) {
    return {
        divisionTeamIds: divisions.map(division => teamId),
        divisionTournamentIds: divisions.map(division => tournamentId)
    }
}