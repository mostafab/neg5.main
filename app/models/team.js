var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var playerSchema = require("./player").schema;

var teamSchema = new Schema({
    team_name : String,
    email : String,
    division : String,
    wins : {type : Number, default : 0},
    losses : {type : Number, default : 0},
    ties : {type : Number, default : 0},
});

teamSchema.methods.getWinPercentage = function() {
    if (this.wins + this.losses == 0) {
        return 0;
    } else {
        return (this.wins / (this.wins + this.losses));
    }
}

// teamSchema.methods.getTeamMembers = function(tournamentid, callback) {
//     var Tournament = mongoose.model("Tournament");
//     var thisName = this.team_name;
//     var query = Tournament.findOne({_id : tournamentid}).exec(function(err, result) {
//         if (err) {
//             callback(err, []);
//         } else {
//             var members = [];
//             for (var i = 0; i < result.players.length; i++) {
//                 if (result.players[i].team == thisName) {
//                     members.push(result.players[i]);
//                 }
//             }
//             callback(null, members);
//         }
//     });
// }

teamSchema.methods.getTotalPointValues = function(tournamentid) {
    // var Tournament = mongoose.model("Tournament");
}

module.exports = mongoose.model("Team", teamSchema);
