var mongoose = require("mongoose");

var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var Team = mongoose.model("Team");

/**
* Adds a tournament to the specified td - "tournament director" array of tournaments
* @return true if adding tournament succeesed, false otherwise
*/
function addTournament(td, name, date, location, description) {
    var tourney = new Tournament({
        name : name,
        location : location,
        date : date,
        description : description
    });
    TournamentDirector.findOneAndUpdate(
        {email : "test@domain.com"},
        {$push : {tournaments : tourney}},
        {safe : true, upsert : true},
        function(err, model) {
            if (err) {
                console.log("Error: " + err);
                return false;
            } else {
                
            }
    });
    return true;
}

function addTeam(td, name) {
    team = new Team({
        name : name
    });

}

exports.addTournament = addTournament;
