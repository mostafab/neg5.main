import { query, queryTypeMap as qm } from '../database/db';
import { buildTeamPlayersArray } from './team';
import sql from '../database/sql';

const player = sql.player;
const team = sql.team;

export default {

  addTournamentPlayer: (tournamentId, teamId, { id, name }, currentUser) => 
    new Promise((resolve, reject) => {
      const playersArray = [{ id, teamId, name }];
      const { tournamentIds, playerIds, playerNames,
        teamIds, addedBy } = buildTeamPlayersArray(tournamentId, playersArray, currentUser);
      const params = [playerIds, playerNames, teamIds, tournamentIds, addedBy];
      query(team.add.addPlayers, params, qm.one)
          .then(result => resolve(result))
          .catch(error => reject(error));
    }),

  editPlayerName: (tournamentId, playerId, name) => {
      return new Promise((resolve, reject) => {
          let params = [tournamentId, playerId, name];
          query(player.edit, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  },

  deletePlayer: (tournamentId, playerId) => {
      return new Promise((resolve, reject) => {
          let params = [tournamentId, playerId];
          query(player.remove, params, qm.one)
              .then(result => resolve(result))
              .catch(error => reject(error));
      })
  }

}
