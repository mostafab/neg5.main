import shortid from 'shortid';
import db from './../../data-access/match';

export default {

    findByTournament: (tournamentId) => {
        return new Promise((resolve, reject) => {
            db.getMatchesByTournament(tournamentId)
                .then(games => resolve(games))
                .catch(error => reject(error)); 
        })
    },

    findById: (tournamentId, matchId) => {
        return new Promise((resolve, reject) => {
            db.findById(tournamentId, matchId)
                .then(result => resolve(result))
                .catch(error => reject(error));
        })
    },

    addToTournament: (tournamentId, gameInfo, user, matchId = undefined) => {
        return new Promise((resolve, reject) => {
            let {
                moderator = null, 
                notes = null, 
                packet = null, 
                phases, 
                room = null, 
                round = 0, 
                teams, 
                tuh = 20} = gameInfo;

            if (!phases || !teams || phases.length === 0) return reject(new Error('Phases and teams are both required'));
            
            let matchInfo = match({
                id: matchId,
                moderator,
                notes,
                packet,
                phases,
                room,
                round,
                teams,
                tuh
            })
            
            db.addToTournament(tournamentId, matchInfo, user, matchId ? true : false)
                .then(result => resolve(result))
                .catch(error => reject(error));

        });
    }

}

function match({id = shortid.generate(), moderator, notes, packet, phases, room, round, teams, tuh}) {
    return {
        id,
        moderator: moderator === null ? null : moderator.trim(),
        notes: notes === null ? null : notes.trim(),
        packet: packet === null ? null : packet.trim(),
        phases,
        room: room === null ? null : room.trim(),
        round,
        teams,
        tuh
    }
}