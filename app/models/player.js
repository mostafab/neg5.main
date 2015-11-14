var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TeamSchema = require("./team").schema;

var playerSchema = new Schema({
    name : String,
    team : String,
    gamesPlayed : Number,
    pointValues : {}
});

module.exports = mongoose.model("Player", playerSchema);
