'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
* Schema representing a game in the mongoDB database
* Each game has a round, tossupsheard, two teams, and
* other miscellaneous information
*/
const gameSchema = new Schema({
    shortID : {type : String, required : true},
    phase_id : {type : Array, required : true, default : []},
    forfeit : {type : Boolean, default : false},
    round : {type : Number, default : 0, set : num => {
        if (num == null) {
            return 0;
        }
        return num;
    }},
    tossupsheard : {type : Number, default: 20, set : tossups => {
        if (tossups == null) {
            return 20;
        }
        return tossups;
    }},
    team1 : {
        team_name : String,
        team_id : String,
        score : {type : Number, default : 0, set : score => {
            return score == null ? 0 : score;
        }},
        bouncebacks : {type : Number, default : 0, set : bb => {
            return bb == null ? 0 : bb;
        }},
        overtimeTossupsGotten : Number,
        playerStats : {type : {}, default : {}}
    },
    team2 : {
        team_name : String,
        team_id : String,
        score : {type : Number, default : 0, set : score => {
            return score == null ? 0 : score;
        }},
        bouncebacks : {type : Number, default : 0, set : bb => {
            return bb == null ? 0 : bb;
        }},
        overtimeTossupsGotten : Number,
        playerStats : {type : {}, default : {}}
    },
    room : String,
    moderator : String,
    packet : String,
    notes : String,
    phases : []
});

/**
* Returns the id of the team that won this game
* @deprecated
*/
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
