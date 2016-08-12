import {query, transaction, queryTypeMap as qm, txMap as tm} from '../database/db';
import sql from '../database/sql';

const {tournament, collaborator, division, phase} = sql;

export default {
    
    
    saveTournament: (tournamentInfo) => {

        return new Promise((resolve, reject) => {
            
            const {id, name, date, questionSet, comments, location, tossupScheme, username} = tournamentInfo;
            
            let tournamentParams = [id, name, date, questionSet, comments, location, username];        

            let {tournamentIds, values, types} = buildTournamentPointSchemeInsertQuery(tossupScheme, id);
            
            tournamentParams.push(tournamentIds, values, types);
            
            query(tournament.add, tournamentParams, qm.many)
                .then(result => resolve(result))
                .catch(error => reject(error));

        });
        
    },

    findTournamentsByUser: (username) => {

        return new Promise((resolve, reject) => {

            let params = [username];

            query(tournament.findByUser, params, qm.any)
                .then(tournaments => resolve(tournaments))
                .catch(error => {
                    reject(error);
                });
                
        })
    },

    findTournamentById: (id) => {
        
        return new Promise((resolve, reject) => {
            let params = [id];

            query(tournament.findById, params, qm.one)
                .then(tournament => {
                    resolve(tournament);
                })
                .catch(error => {
                    reject(error);
                });

        })
    },

    updateTournament: (id, newInfo) => {
        return new Promise((resolve, reject) => {    
            const {name, location = null, date = null, questionSet = null, comments = null, hidden = false} = newInfo;
            let params = [id, name, location, date, questionSet, comments, hidden];

            query(tournament.update, params, qm.one)
                .then(updatedInfo => resolve(updatedInfo))
                .catch(error => {
                    reject(error);
                })
        })
    },

    updateRules: (id, {bouncebacks, maxActive}) => {
        return new Promise((resolve, reject) => {
            let params = [id, maxActive, bouncebacks];
            query(tournament.updateRules, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    addTossupPointValue: (id, {type, value}) => {
        return new Promise((resolve, reject) => {
            let params = [id, type, value];

            query(tournament.editPointScheme.add, params, qm.one)
                .then(newTossupValue => resolve(newTossupValue))
                .catch(error => {
                    reject(error);
                })
        })
    },

    updateTossupPointValues: (id, tossupPointValues, bonusPointValue, partsPerBonus) => {
        return new Promise((resolve, reject) => {
            let editQueries = tournament.editPointScheme.edit;

            let queriesArray = [];

            queriesArray.push({
                text: editQueries.deleteTossupValues,
                params: [id],
                queryType: tm.none
            });
            queriesArray.push({
                text: editQueries.updateBonusValues,
                params: [id, bonusPointValue, partsPerBonus],
                queryType: tm.one
            });

            let {tournamentIds, values, types} = buildTournamentPointSchemeInsertQuery(tossupPointValues, id);
            queriesArray.push({
                text: editQueries.updateTossupPointValues,
                params: [id, tournamentIds, values, types],
                queryType: tm.any
            });

            transaction(queriesArray)
                .then(result => {
                    let data = {
                        partsPerBonus: result[1].parts_per_bonus,
                        bonusPointValue: result[1].bonus_point_value,
                        tossupValues: result[2]
                    }
                    resolve(data);
                })
                .catch(error => {
                    reject(error);
                })

        })
    },

    addCollaborator: (id, username, isAdmin) => {
        return new Promise((resolve, reject) => {
            let params = [id, username, isAdmin];
            query(collaborator.add, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    findTournamentCollaborators: (id) => {
        return new Promise((resolve, reject) => {
            let params = [id];
            query(collaborator.findByTournament, params, qm.any)
                .then(result => resolve(result))
                .catch(error => reject(error));
        });
    },

    updateCollaborator: (id, username, isAdmin) => {
        return new Promise((resolve, reject) => {
            let params = [id, username, isAdmin];
            query(collaborator.edit, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        });
    },

    deleteCollaborator: (id, username) => {
        return new Promise((resolve, reject) => {
            let params = [id, username];
            query(collaborator.remove, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        });
    },

    getTournamentDivisions: (id) => {
        return new Promise((resolve, reject) => {
            let params = [id];
            query(division.findByTournament, params, qm.any)
                .then(result => resolve(result))
                .catch(error => {
                    console.log(error);
                    reject(error);
                });
        })
    },

    editTournamentDivision: (tournamentId, divisionId, newDivisionName) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId, divisionId, newDivisionName];
            query(division.edit, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        });
    },

    addTournamentDivision: (tournamentId, divisionName, divisionId, phaseId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId, divisionId, divisionName, phaseId];
            query(division.add, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    removeDivisionFromTournament: (tournamentId, divisionId) => {
        return new Promise((resolve, reject) => {
            let params = [tournamentId, divisionId];
            query(division.remove, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    getTournamentPhases: (id) => {
        return new Promise((resolve, reject) => {
            let params = [id];
            query(phase.findByTournament, params, qm.any)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    updateTournamentPhase: (id, phaseId, newName) => {
        return new Promise((resolve, reject) => {
            let params = [id, phaseId, newName];
            query(phase.update, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    addTournamentPhase: (id, phaseId, name) => {
        return new Promise((resolve, reject) => {
            let params = [id, phaseId, name];
            query(phase.add, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    deleteTournamentPhase: (id, phaseId) => {
        return new Promise((resolve, reject) => {
            let params = [id, phaseId];
            query(phase.remove, params, qm.one)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }
    
}

function buildTournamentPointSchemeInsertQuery(rows, tournamentId) {

    let tournamentIds = rows.map(row => tournamentId);
    let values = rows.map(row => row.value);
    let types = rows.map(row => row.type);

    return {
        tournamentIds,
        values,
        types
    };
}