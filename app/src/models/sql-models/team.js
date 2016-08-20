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

    findById: (tournamentId, teamId) => {
        return new Promise((resolve, reject) => {
            db.findById(tournamentId, teamId)
                .then(team => resolve(team))
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
    },

    updateName: (tournamentId, teamId, newName) => {
        return new Promise((resolve, reject) => {
            if (!newName || newName.trim().length === 0) return reject(new Error('Invalid new name: ' + newName))
            newName = newName.trim();
            db.updateTeamName(tournamentId, teamId, newName)
                .then(team => resolve(team))
                .catch(error => reject(error));
        })
    },

    updateDivisions: (tournamentId, teamId, divisions) => {
        return new Promise((resolve, reject) => {
            let filteredDivisions = divisions.filter(division => division);
            db.updateTeamDivisions(tournamentId, teamId, filteredDivisions)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }

}