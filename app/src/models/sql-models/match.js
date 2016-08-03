import shortid from 'shortid';
import db from './../../data-access/match';

export default {

    findByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.getMatchesByTournament(tournamentId)
                .then(games => resolve(games))
                .catch(error => reject(error)); 
        })
    },

    addToTournament: (tournamentId, gameInfo) => {
        return new Promise((resolve, reject) => {
            resolve(gameInfo);
        });
    }

}