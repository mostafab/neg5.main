var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var playerSchema = require("./player").schema;

var TeamSchema = new Schema({
    name : String,
    wins : {type : Number, default : 0},
    losses : {type : Number, default : 0},
    ties : {type : Number, default : 0},
    players : [playerSchema]
});

module.exports = mongoose.model("Team", TeamSchema);
