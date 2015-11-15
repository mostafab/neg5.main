var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TeamSchema = require("./team").schema;

var playerSchema = new Schema({
    name : String,
    team : String,
    gamesPlayed : {type : Number, default : 0},
    pointValues : {type : {}, default: {"15" : 0, "10" : 0, "-5" : 0}}
});

module.exports = mongoose.model("Player", playerSchema);
