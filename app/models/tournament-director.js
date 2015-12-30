'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var tournamentSchema = require("./tournament").schema;
var Tournament = mongoose.model("Tournament");

function toLower(string) {
    return string.toLowerCase();
}

/**
* Schema for a tournament director.
*/
var TournamentDirectorSchema = new Schema({
    usertoken : {type : String, required : true},
    name : {type : String, required : true},
    email : {type : String, required : true, set : toLower}
});

module.exports = mongoose.model("TournamentDirector", TournamentDirectorSchema);
