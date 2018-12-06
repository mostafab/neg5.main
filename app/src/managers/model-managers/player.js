import db from './../../data-access/player';

import generateId from './../../helpers/id';

export default {

    addPlayer: (tournamentId, teamId, name, currentUser) => {
        return new Promise((resolve, reject) => {
            if (!name || name.trim().length === 0) {
                return reject(new Error('Invalid player name: ' + name))
            }
            let player = { id: generateId(), name: name.trim()}
            db.addTournamentPlayer(tournamentId, teamId, player, currentUser)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    editPlayerName: (tournamentId, playerId, name) => {
        return new Promise((resolve, reject) => {
            if (!name || name.trim().length === 0) {
                return reject(new Error('Invalid player name: ' + name))
            }
            db.editPlayerName(tournamentId, playerId, name.trim())
                .then(result => {
                    resolve(result);
                })
                .catch(error => reject(error));

        })
    },

    deletePlayer: (tournamentId, playerId) => {
        return new Promise((resolve, reject) => {
            db.deletePlayer(tournamentId, playerId)
                .then(result => {
                    resolve(result);
                })
                .catch(error => reject(error));
        })
    }

}