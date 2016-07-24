import shortid from 'shortid';
import db from '../../data-access/tournament';

export default {
    
    create: ({name, date = null, questionSet = null, comments = null, location = null, tossupScheme = []}, username) => {
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

    findById: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.findTournamentById(tournamentId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    update: (tournamentId, {location = null, name, date = null, questionSet = null, comments = null, hidden = false}) => {
        return new Promise((resolve, reject) => {
            let newTournamentInfo = {
                location: location === null ? null : location.trim(),
                name: name.trim(),
                questionSet: questionSet === null ? null : questionSet.trim(),
                comments: comments === null ? null : comments.trim(),
                hidden
            }
            db.updateTournament(tournamentId, newTournamentInfo)
                .then(result => resolve(result))
                .catch(error => reject(error))
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
            let validPoints = newPointValues.every(pv => pv.type && pv.value);
            if (validPoints) {
                db.updateTossupPointValues(tournamentId, newPointValues)
                    .then(result => resolve(result))
                    .catch(error => reject(error))
            }
        })
    }
    
}