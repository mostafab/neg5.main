var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = require("./team").schema;

var gameSchema = new Schema({
    round : {type : Number, default : 0, set : function(num) {
        return Math.round(num);
    }},
    teams : [teamSchema],
    score : String
});

module.exports = mongoose.model("Game", gameSchema);
