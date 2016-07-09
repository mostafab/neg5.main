import db from '../../data-access/tournament';

export default {
    
    create: (tournamentPayload) => {
        return new Promise((resolve, reject) => {
           db.saveTournament(tournamentPayload)
                .then(result => resolve(result))
                .catch(error => reject(error)); 
        });
    }
    
}