var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TeamSchema = require("./team").schema;

var playerSchema = new Schema({
    player_name : String,
    teamID : String,
    team_name : String,
    gamesPlayed : {type : Number, default : 0},
    pointValues : {type : {}},
    shortID : String
});

playerSchema.methods.getPointsPerGame = function() {
    if (this.gamesPlayed == 0) {
        return 0;
    }
    var sum = 0;
    for (vals in this.pointValues) {
        sum += this.pointValues[vals] * parseInt(vals);
    }
    return this.sum / this.gamesPlayed;
}

module.exports = mongoose.model("Player", playerSchema);
