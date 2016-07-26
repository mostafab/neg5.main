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
                .then(tournament => {
                    tournament.tossup_point_scheme = tournament.tossup_point_scheme.filter(tv => {
                        return tv.type !== null;
                    }).sort((first, second) => {
                        return first.value - second.value;
                    });
                    resolve(tournament);
                })
                .catch(error => reject(error));
        })
    },

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
    }
    
}