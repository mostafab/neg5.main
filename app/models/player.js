var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TeamSchema = require("./team").schema;

var playerSchema = new Schema({
    player_name : String,
    team : String,
    gamesPlayed : {type : Number, default : 0},
    roundGames : {},   // Will hold round info in format Round : % of Game Played
    pointValues : {type : {}, default: {"15" : 0, "10" : 0, "-5" : 0}}
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
