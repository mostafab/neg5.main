var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TournamentSchema = new Schema({
    name : String,
    location : String
});

module.exports = mongoose.model("Tournament", TournamentSchema);
