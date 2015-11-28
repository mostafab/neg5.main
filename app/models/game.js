var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var teamSchema = require("./team").schema;

var gameSchema = new Schema({
    shortID : {type : String, unique: true},
    round : {type : Number, default : 0, set : function(num) {
        return Math.floor(num);
    }},
    tossupsheard : {type : Number, default: 20},
    team1 : {
        team_name : String,
        team_id : String,
        score : {type : Number, default : 0},
        playerStats : {}
    },
    team2 : {
        team_name : String,
        team_id : String,
        score :  {type : Number, default : 0},
        playerStats : {}
    }
});

gameSchema.methods.getWinner = function() {
    if (this.team1["score"] > this.team2["score"]) {
        return [this.team1["team_id"], this.team2["team_id"]];
    } else if (this.team1["score"] < this.team2["score"]) {
        return [this.team2["team_id"], this.team1["team_id"]];
    } else {
        return [this.team1["team_id"], this.team2["team_id"], "TIE"];
    }
}

module.exports = mongoose.model("Game", gameSchema);
