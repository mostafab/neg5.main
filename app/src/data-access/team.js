import { query, transaction, queryTypeMap as qm, txMap as tm } from '../database/db';
import sql from '../database/sql';

const teamSQL = sql.team;

export function buildTeamPlayersArray(tournamentId, players, currentUser) {
  return {
    tournamentIds: players.map(() => tournamentId),
    playerIds: players.map(player => player.id),
    playerNames: players.map(player => player.name),
    teamIds: players.map(player => player.teamId),
    addedBy: players.map(() => currentUser),
  };
}

export function buildTeamDivisionsArray(tournamentId, teamId, divisions) {
  return {
    divisionTeamIds: divisions.map(() => teamId),
    divisionTournamentIds: divisions.map(() => tournamentId),
  };
}

export default {
  getTeamsByTournament: tournamentId => new Promise((resolve, reject) => {
    const params = [tournamentId];
    query(teamSQL.findByTournament, params, qm.any)
      .then((allTeams) => {
        const formattedTeams = allTeams.map(team => ({
          ...team,
          team_divisions: team.team_divisions.filter(division => division.phase_id !== null),
        }));
        resolve(formattedTeams);
      })
      .catch(error => reject(error));
  }),

  findById: (tournamentId, teamId) => new Promise((resolve, reject) => {
    const params = [tournamentId, teamId];
    query(teamSQL.findById, params, qm.one)
        .then(team => resolve(team))
        .catch(error => reject(error));
  }),

  addTeamToTournament: (tournamentId, teamId, teamName, players, divisionIds, currentUser) =>
    new Promise((resolve, reject) => {
      const addTeamQueries = teamSQL.add;
      const queriesArray = [];
      const { playerIds, playerNames, teamIds,
        tournamentIds, addedBy } = buildTeamPlayersArray(tournamentId, players, currentUser);
      const { divisionTeamIds,
        divisionTournamentIds } = buildTeamDivisionsArray(tournamentId, teamId, divisionIds);

      queriesArray.push(
        {
          text: addTeamQueries.addTeam,
          params: [teamId, teamName, tournamentId, currentUser],
          queryType: tm.one,
        },
        {
          text: addTeamQueries.addPlayers,
          params: [playerIds, playerNames, teamIds, tournamentIds, addedBy],
          queryType: tm.any,
        },
        {
          text: addTeamQueries.addDivisions,
          params: [divisionTeamIds, divisionIds, divisionTournamentIds],
          queryType: tm.any,
        },
      );
      transaction(queriesArray)
          .then((result) => {
            const formattedResult = {
              team: result[0],
              players: result[1],
              divisions: result[2],
            };
            resolve(formattedResult);
          })
          .catch(error => reject(error));
    }),

  updateTeamName: (tournamentId, teamId, name) => new Promise((resolve, reject) => {
    const params = [tournamentId, teamId, name];
    query(teamSQL.updateName, params, qm.one)
        .then(team => resolve(team))
        .catch(error => reject(error));
  }),

  updateTeamDivisions: (tournamentId, teamId, divisions) => new Promise((resolve, reject) => {
    const queriesArray = [];
    const { divisionTeamIds,
       divisionTournamentIds } = buildTeamDivisionsArray(tournamentId, teamId, divisions);
    queriesArray.push(
      {
        text: teamSQL.removeDivisions,
        params: [tournamentId, teamId],
        queryType: tm.none,
      },
      {
        text: teamSQL.add.addDivisions,
        params: [divisionTeamIds, divisions, divisionTournamentIds],
        queryType: tm.any,
      },
    );
    transaction(queriesArray)
        .then(result => resolve({ divisions: result[1] }))
        .catch(error => reject(error));
  }),

  deleteTeam: (tournamentId, teamId) => new Promise((resolve, reject) => {
    const params = [tournamentId, teamId];
    query(teamSQL.remove, params, qm.one)
        .then(result => resolve(result))
        .catch(error => reject(error));
  }),
};
