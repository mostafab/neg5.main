var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var gameSchema = new Schema({
    shortID : String,
    round : {type : Number, default : 0, set : function(num) {
        if (num == null) {
            return 0;
        }
        return num;
    }},
    tossupsheard : {type : Number, default: 20, set : function(tossups) {
        if (tossups == null) {
            return 20;
        }
        return tossups;
    }},
    team1 : {
        team_name : String,
        team_id : String,
        score : {type : Number, default : 0, set : function(score) {
            return score == null ? 0 : score;
        }},
        bouncebacks : {type : Number, default : 0, set : function(bb) {
            return bb == null ? 0 : bb;
        }},
        playerStats : {type : {}, default : {}}
    },
    team2 : {
        team_name : String,
        team_id : String,
        score : {type : Number, default : 0, set : function(score) {
            return score == null ? 0 : score;
        }},
        bouncebacks : {type : Number, default : 0, set : function(bb) {
            return bb == null ? 0 : bb;
        }},
        playerStats : {type : {}, default : {}}
    },
    room : String,
    moderator : String,
    packet : String,
    notes : String
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
