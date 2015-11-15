var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var playerSchema = require("./player").schema;

var TeamSchema = new Schema({
    name : String,
    email : String,
    division : String,
    wins : {type : Number, default : 0},
    losses : {type : Number, default : 0},
    ties : {type : Number, default : 0},
});

module.exports = mongoose.model("Team", TeamSchema);
