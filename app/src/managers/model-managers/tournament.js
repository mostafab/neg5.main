import shortid from 'shortid';
import db from '../../data-access/tournament';
import { bufferTournamentStatsChangedEmittion } from '../../subscribers/match-event-emitter-subscriber';

export default {

    create: ({name, date = null, questionSet = null, comments = null, location = null, tossupScheme = defaultPointScheme()}, username) => {
        return new Promise((resolve, reject) => {
           const id = shortid.generate(); 
           let tournament = {
               id,
               name : name.trim(),
               date,
               questionSet: questionSet === null ? null : questionSet.trim(),
               comments: comments === null ? null : comments.trim(),
               location: location === null ? null : location.trim(),
               tossupScheme,
               username
           }
           db.saveTournament(tournament)
                .then(result => resolve(result))
                .catch(error => reject(error)); 
        });
    },

    findByUser: (username) => {
        return new Promise((resolve, reject) => {
            db.findTournamentsByUser(username.trim().toLowerCase())
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    findById: (tournamentId, currentUser = null) => {
        return new Promise((resolve, reject) => {
            db.findTournamentById(tournamentId, currentUser, currentUser !== null)
                .then(result => {
                    result.tournament.tossup_point_scheme = result.tournament.tossup_point_scheme.filter(tv => {
                        return tv.type !== null;
                    }).sort((first, second) => {
                        return first.value - second.value;
                    });
                    resolve(result);
                })
                .catch(error => reject(error));
        })
    },

    // Default to a month
    findRecent: (daysSince = 30) => new Promise((resolve, reject) => {
        db.findRecent(daysSince)
            .then(result => resolve(result))
            .catch(err => reject(err));
    }),

    findBetweenDates: (startDate, endDate) => new Promise((resolve, reject) => {
        db.findBetweenDates(startDate, endDate)
            .then(result => resolve(result))
            .catch(err => reject(err));
    }),

    findByName: query => new Promise((resolve, reject) => {
        db.findByName(query.trim())
            .then(result => resolve(result))
            .catch(err => reject(err));
    }),

    update: (tournamentId, {location = null, name, date = null, questionSet = null, comments = null, hidden = false}) => {
        return new Promise((resolve, reject) => {
            let newTournamentInfo = {
                location: location === null ? null : location.trim(),
                name: name.trim(),
                questionSet: questionSet === null ? null : questionSet.trim(),
                date,
                comments: comments === null ? null : comments.trim(),
                hidden
            }
            db.updateTournament(tournamentId, newTournamentInfo)
                .then(result => resolve(result))
                .catch(error => reject(error))
        })
    },

    updateRules: (tournamentId, newRules) => {
        return new Promise((resolve, reject) => {
            let {bouncebacks, maxActive} = newRules;
            if (maxActive < 0) {
                reject(new Error(`Invalid data - bouncebacks: ${bouncebacks}, maxActive: ${maxActive}`))
            }
            db.updateRules(tournamentId, {bouncebacks, maxActive})
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    addTossupPointValue: (tournamentId, {type, value}) => {
        return new Promise((resolve, reject) => {
            if (!type || !value) {
                return reject(new Error('Not all required fields provided'));
            }
            db.addTossupPointValue(tournamentId, {type, value})
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    updateTossupPointValues: (tournamentId, newPointValues) => {
        return new Promise((resolve, reject) => {
            let validPoints = newPointValues.tossupValues.every(pv => pv.type && typeof(pv.value) === 'number');
            if (validPoints) {
                db.updateTossupPointValues(tournamentId, newPointValues.tossupValues, newPointValues.bonusPointValue, newPointValues.partsPerBonus)
                    .then(result => resolve(result))
                    .catch(error => reject(error))
            } else {
                reject(new Error('Invalid point values given'));
            }
        })
    },

    addCollaborator: (tournamentId, currentUser, username, isAdmin = false) => {
        return new Promise((resolve, reject) => {
            if (currentUser === username) return reject(new Error('Cannot add yourself as a collaborator'));
            db.addCollaborator(tournamentId, username, isAdmin)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    findCollaborators: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.findTournamentCollaborators(tournamentId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    updateCollaborator: (tournamentId, username, isAdmin = false) => {
        return new Promise((resolve, reject) => {
            db.updateCollaborator(tournamentId, username.toLowerCase(), isAdmin)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    removeCollaborator: (tournamentId, username) => {
        return new Promise((resolve, reject) => {
            db.deleteCollaborator(tournamentId, username.toLowerCase())
                .then(deletedCollab => resolve(deletedCollab))
                .catch(error => reject(error));
        })
    },

    getDivisions: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.getTournamentDivisions(tournamentId)
                .then(divisions => resolve(divisions))
                .catch(error => reject(error));
        })
    },

    editDivision: (tournamentId, divisionId, newDivisionName) => {
        return new Promise((resolve, reject) => {
            if (!newDivisionName) return reject(new Error('Invalid division name: ' + newDivisionName));
            db.editTournamentDivision(tournamentId, divisionId, newDivisionName.trim())
                .then(division => resolve(division))
                .catch(error => reject(error));
        })
    },

    addDivision: (tournamentId, divisionName, phaseId) => {
        return new Promise((resolve, reject) => {
            if (!divisionName || !divisionName.trim()) return reject(new Error('Invalid division name: ' + divisionName));
            let divisionId = shortid.generate();
            db.addTournamentDivision(tournamentId, divisionName.trim(), divisionId, phaseId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    removeDivision: (tournamentId, divisionId) => {
        return new Promise((resolve, reject) => {
            db.removeDivisionFromTournament(tournamentId, divisionId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    getPhases: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.getTournamentPhases(tournamentId)
                .then(phases => resolve(phases))
                .catch(error => reject(error));
        })
    },

    updatePhase: (tournamentId, phaseId, newPhaseName) => {
        return new Promise((resolve, reject) => {
            newPhaseName = newPhaseName.trim();
            db.updateTournamentPhase(tournamentId, phaseId, newPhaseName)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    addPhase: (tournamentId, name) => {
        return new Promise((resolve, reject) => {
            let phaseName = name.trim();
            let id = shortid.generate();
            db.addTournamentPhase(tournamentId, id, phaseName)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    removePhase: (tournamentId, phaseId) => {
        return new Promise((resolve, reject) => {
            db.deleteTournamentPhase(tournamentId, phaseId)
                .then(result => {
                    resolve(result)
                    bufferTournamentStatsChangedEmittion(tournamentId);
                })
                .catch(error => reject(error));
        })
    },

    setActivePhase: (tournamentId, phaseId = null) => {
        return new Promise((resolve, reject) => {
            db.setTournamentActivePhase(tournamentId, phaseId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    }
    
}

function defaultPointScheme() {
    return [
        {
            value: 10,
            type: 'Base'
        },
        {
            value: 15,
            type: 'Power'
        },
        {
            value: -5,
            type: 'Neg'
        }
    ]
}