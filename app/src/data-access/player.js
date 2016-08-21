import {query, transaction, queryTypeMap as qm, txMap as tm} from '../database/db';
import {buildTeamPlayersArray} from './team';
import sql from '../database/sql';

const player = sql.player;
const team = sql.team;

export default {

    addTournamentPlayer: (tournamentId, teamId, {id, name}, currentUser) => {
        return new Promise((resolve, reject) => {
            let playersArray = [{id, teamId, name}];
            let {tournamentIds, playerIds, playerNames, teamIds, addedBy} = buildTeamPlayersArray(tournamentId, playersArray, currentUser);
            let params = [playerIds, playerNames, teamIds, tournamentIds, addedBy];
            query(team.add.addPlayers, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

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
