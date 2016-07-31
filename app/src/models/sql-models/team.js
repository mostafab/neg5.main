import shortid from 'shortid';
import db from './../../data-access/team';

export default {

    findByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.getTeamsByTournament(tournamentId)
                .then(teams => resolve(teams))
                .catch(error => reject(error)); 
        })
    },

    addToTournament: (tournamentId, {name, players = [], divisions = []}, user) => {
        return new Promise((resolve, reject) => {
            const teamId = shortid.generate();
            let formattedTeamName = name.trim();
            let formattedPlayers = players.map(player => {
                return {
                    teamId,
                    id: shortid.generate(),
                    name: player.name.trim()
                }
            });
            db.addTeamToTournament(tournamentId, teamId, formattedTeamName, formattedPlayers, divisions, user)
                .then(team => resolve(team))
                .catch(error => reject(error));
        }); 
    }

}