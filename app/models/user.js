var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// var Tournament = mongoose.model("Tournament");
var tournamentSchema = require("./tournament").schema;
console.log("Tourney Schema: " + tournamentSchema);

var UserSchema = new Schema({
    name : String,
    email : String,
    password : String,
    tournaments : [tournamentSchema]
});

module.exports = mongoose.model("User", UserSchema);
