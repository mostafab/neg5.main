const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tournamentSchema = require("./tournament").schema;
const Tournament = mongoose.model("Tournament");

function toLower(string) {
    return string.toLowerCase();
}

/**
* Schema for a tournament director.
*/
const TournamentDirectorSchema = new Schema({
    usertoken : {type : String, required : true},
    name : {type : String, required : true},
    email : {type : String, required : true, set : toLower}
});

module.exports = mongoose.model("TournamentDirector", TournamentDirectorSchema);
