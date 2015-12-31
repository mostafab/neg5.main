var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = require("./team").schema;
var gameSchema = require("./game").schema;
var playerSchema = require("./player").schema;

/**
* Schema for a tournament. Tournaments include a list of collaborators,
* teams, players, games, and other information like pointScheme and pointsTypes
* used to generate statistics.
* For pointsTypes, there are three possible options:
*                   "P" : Power
*                   "B" : Base Point Value
*                   "N" : Neg
*/
var TournamentSchema = new Schema({
    createdAt : {type : Date, default : Date.now()},
    directorid : String, // Foreign key,
    tournament_name : String,
    collaborators : [{}], // List of emails of collaborators
    location : String,
    date : {type : Date, set : setDate},
    openRegistration : {type : Boolean, default : false},
    questionSet : String,
    description : String,
    teams : [teamSchema],
    players : [playerSchema],
    divisions : [String],
    games : [gameSchema],
    pointScheme : {type : {}, default : {"15" : 0, "10" : 0, "-5" : 0}},
    pointsTypes : {type : {}, default : {"15" : "P", "10" : "B", "-5" : "N"}},
    shortID : {type : String, index : true, unique : true}
});

function setDate(date) {
    if (!date) {
        return new Date();
    } else {
        return date;
    }
}

module.exports = mongoose.model("Tournament", TournamentSchema);
