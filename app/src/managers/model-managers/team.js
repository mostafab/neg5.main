import shortid from 'shortid';
import db from './../../data-access/team';
import { bufferTournamentStatsChangedEmittion } from '../../subscribers/match-event-emitter-subscriber';
import generateId from './../../helpers/id';

export default {

    findByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.getTeamsByTournament(tournamentId)
                .then(teams => resolve(teams))
                .catch(error => reject(error)); 
        })
    },

    findForStats: async tournamentId => {
        try {
            return await db.findAllForStats(tournamentId);
        } catch (err) {
            throw err;
        }
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
            const teamId = generateId();
            let formattedTeamName = name.trim();
            let formattedPlayers = players.map(player => {
                return {
                    teamId,
                    id: generateId(),
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
                .then(team => {
                    resolve(team)
                    bufferTournamentStatsChangedEmittion({ tournamentId })
                })
                .catch(error => reject(error));
        })
    },

    updateDivisions: (tournamentId, teamId, divisions) => {
        return new Promise((resolve, reject) => {
            let filteredDivisions = divisions.filter(division => division);
            db.updateTeamDivisions(tournamentId, teamId, filteredDivisions)
                .then(result => {
                    resolve(result);
                })
                .catch(error => reject(error));
        })
    },

    deleteTeam: (tournamentId, teamId) => {
        return new Promise((resolve, reject) => {
            db.deleteTeam(tournamentId, teamId)
                .then(result => {
                    resolve(result);
                    bufferTournamentStatsChangedEmittion({ tournamentId });
                })
                .catch(error => reject(error));
        })
    }

}