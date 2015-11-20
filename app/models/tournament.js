var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = require("./team").schema;
var gameSchema = require("./game").schema;
var playerSchema = require("./player").schema;

var TournamentSchema = new Schema({
    director_email : String, // Foreign key
    tournament_name : String,
    location : String,
    date : {type : Date, default : Date.now},
    openRegistration : {type : Boolean, default : true},
    questionSet : String,
    description : String,
    teams : [teamSchema],
    players : [playerSchema],
    divisions : [String],
    games : [gameSchema]
});



module.exports = mongoose.model("Tournament", TournamentSchema);
