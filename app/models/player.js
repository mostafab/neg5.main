var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var playerSchema = new Schema({
    name : String,
    pointValues : {}
});

module.exports = mongoose.model("Player", playerSchema);
