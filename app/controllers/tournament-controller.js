var mongoose = require("mongoose");

var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var Team = mongoose.model("Team");

/**
* Adds a tournament to the specified td - "tournament director" array of tournaments
* @return true if adding tournament succeesed, false otherwise
*/
function addTournament(directorKey, name, date, location, description) {
    var tourney = new Tournament({
        director_email : directorKey, // Foreign Key
        name : name,
        location : location,
        date : date,
        description : description
    });
    tourney.save(function(err) {
        if (err) {
            console.log("Unable to save tournament");
            return false;
        } else {

        }
    });
    return true;
}

function findTournamentsByDirector(directorKey) {
    var query = Tournament.find({director_email : directorKey}, function(err, result) {
        getTournaments(result);
    });
}

function getTournaments(arr) {
    return arr;
}

exports.addTournament = addTournament;
exports.findTournamentsByDirector = findTournamentsByDirector;
