var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = require("./team").schema;
var gameSchema = require("./game").schema;

var TournamentSchema = new Schema({
    name : String,
    location : String,
    date : {type : Date, default : Date.now},
    teams : [teamSchema],
    games : [gameSchema]
});

module.exports = mongoose.model("Tournament", TournamentSchema);
