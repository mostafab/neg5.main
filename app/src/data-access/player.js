import { query, queryTypeMap as qm } from '../database/db';
import { buildTeamPlayersArray } from './team';
import sql from '../database/sql';

const playerSQL = sql.player;
const teamSQL = sql.team;

export default {

  addTournamentPlayer: (tournamentId, teamId, { id, name }, currentUser) =>
    new Promise((resolve, reject) => {
      const playersArray = [{ id, teamId, name }];
      const { tournamentIds, playerIds, playerNames,
        teamIds, addedBy } = buildTeamPlayersArray(tournamentId, playersArray, currentUser);
      const params = [playerIds, playerNames, teamIds, tournamentIds, addedBy];
      query(teamSQL.add.addPlayers, params, qm.one)
          .then(result => resolve(result))
          .catch(error => reject(error));
    }),

  editPlayerName: (tournamentId, playerId, name) => new Promise((resolve, reject) => {
    const params = [tournamentId, playerId, name];
    query(playerSQL.edit, params, qm.one)
        .then(result => resolve(result))
        .catch(error => reject(error));
  }),

  deletePlayer: (tournamentId, playerId) => new Promise((resolve, reject) => {
    const params = [tournamentId, playerId];
    query(playerSQL.remove, params, qm.one)
        .then(result => resolve(result))
        .catch(error => reject(error));
  })

}
