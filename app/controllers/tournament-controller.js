var mongoose = require("mongoose");

var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var Team = mongoose.model("Team");

/**
* Adds a tournament to the specified td - "tournament director" array of tournaments
* @return true if adding tournament succeesed, false otherwise
*/
function addTournament(directorKey, name, date, location, description, questionset) {
    var tourney = new Tournament({
        director_email : directorKey, // Foreign Key
        name : name,
        location : location,
        date : date,
        description : description,
        questionSet : questionset
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

/**
* Returns a list of the tournaments owned by the given directorKey
* @return list of all the tournmanets with a director_email of directorKey.
* returns an empty list if result is empty
*/
function findTournamentsByDirector(directorKey, callback) {
    var query = Tournament.find({director_email : directorKey}).exec(function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

function getTournaments(arr) {
    return arr;
}

exports.addTournament = addTournament;
exports.findTournamentsByDirector = findTournamentsByDirector;
