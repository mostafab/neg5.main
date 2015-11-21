var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tournamentSchema = require("./tournament").schema;
var Tournament = mongoose.model("Tournament");

var TournamentDirectorSchema = new Schema({
    name : String,
    email : String,
});

module.exports = mongoose.model("TournamentDirector", TournamentDirectorSchema);
