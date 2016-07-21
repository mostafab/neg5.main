import db from './../../data-access/team';

export default {

    findByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.getTeamsByTournament(tournamentId)
                .then(teams => resolve(teams))
                .catch(error => reject(error)); 
        })
    }

}