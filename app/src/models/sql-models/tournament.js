import db from '../../data-access/tournament';

export default {
    
    create: (tournamentPayload) => {
        return new Promise((resolve, reject) => {
           db.saveTournament(tournamentPayload)
                .then(result => resolve(result))
                .catch(error => reject(error)); 
        });
    },

    findByUser: (username) => {
        return new Promise((resolve, reject) => {
            db.findTournamentsByUser(username)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    findById: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.findTournamentById(tournamentId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }
    
}