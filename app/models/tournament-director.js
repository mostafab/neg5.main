var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tournamentSchema = require("./tournament").schema;
var Tournament = mongoose.model("Tournament");

function toLower(string) {
    return string.toLowerCase();
}

var TournamentDirectorSchema = new Schema({
    name : {type : String, required : true},
    email : {type : String, required : true, set : toLower}
});

module.exports = mongoose.model("TournamentDirector", TournamentDirectorSchema);
