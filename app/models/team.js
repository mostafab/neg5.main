var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var playerSchema = require("./player").schema;

var teamSchema = new Schema({
    team_name : String,
    division : String,
    wins : {type : Number, default : 0},
    losses : {type : Number, default : 0},
    ties : {type : Number, default : 0},
    shortID : String
});

teamSchema.methods.getWinPercentage = function() {
    if (this.wins + this.losses == 0) {
        return 0;
    } else {
        return (this.wins / (this.wins + this.losses));
    }
}

teamSchema.methods.addWin = function() {
    wins++;
}

teamSchema.methods.getTotalPointValues = function(tournamentid) {
    // var Tournament = mongoose.model("Tournament");
}

module.exports = mongoose.model("Team", teamSchema);
