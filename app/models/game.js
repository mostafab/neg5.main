var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = require("./team").schema;

var gameSchema = new Schema({
    round : {type : Number, default : 0, set : function(num) {
        return Math.floor(num);
    }},
    tossupsheard : {type : Number, default: 20},
    team1 : {
        team_id : String,
        score : {type : Number, default : 0},
        playerStats : {}
    },
    team2 : {
        team_id : String,
        score :  {type : Number, default : 0},
        playerStats : {}
    }
});

gameSchema.methods.getWinner = function() {
    if (team1["score"] > team2["score"]) {
        return team1["id"];
    } else {
        return team2["id"];
    }
}

module.exports = mongoose.model("Game", gameSchema);
