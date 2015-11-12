var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tournamentSchema = require("./tournament").schema;

var TournamentDirectorSchema = new Schema({
    name : String,
    email : String,
    tournaments : [tournamentSchema]
});

module.exports = mongoose.model("TournamentDirector", TournamentDirectorSchema);
