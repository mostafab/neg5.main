var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var playerSchema = require("./player").schema;

var TeamSchema = new Schema({
    name : String,
    players : [playerSchema]
});

module.exports = mongoose.model("Team", TeamSchema);
