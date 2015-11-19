var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var teamSchema = require("./team").schema;

var gameSchema = new Schema({
    round : {type : Number, default : 0, set : function(num) {
        return Math.floor(num);
    }},
    team1 : {"id" : ObjectId, "score" : Number, "tossups" : Number, "playerScores" : []},
    team2 : {"id" : ObjectId, "score" : Number, "tossups" : Number, "playerScores" : []},
    tossups : {type : Number, default : 20},
});

gameSchema.methods.getWinner = function() {
    if (team1["score"] > team2["score"]) {
        return team1["id"];
    } else {
        return team2["id"];
    }
}

module.exports = mongoose.model("Game", gameSchema);
