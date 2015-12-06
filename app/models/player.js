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
        if (this.pointValues.hasOwnProperty(vals)) {
            // sum += parseInt(this.pointValues[vals]) * parseInt(vals);
            // console.log(parseInt(vals) * parseInt(this.pointValues[vals]));
            sum += parseInt(vals) * parseInt(this.pointValues[vals]);
        }
    }
    return sum / this.gamesPlayed;
}

playerSchema.methods.getTotalPoints = function(tournament) {
    if (this.gamesPlayed == 0) {
        return 0;
    }
    var sum = 0;
    for (vals in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(vals) && this.pointValues[vals] != undefined) {
            sum += parseInt(tournament.pointScheme[vals] * parseInt(this.pointValues[vals]));
        }
    }
    return sum;
}

playerSchema.methods.getTossupsHeard = function(tournament) {
        var totalTossups = 0;
        for (var i = 0; i < tournament.games.length; i++) {
            var currentGame = tournament.games[i];
            if (currentGame.team1.team_id == this.teamID) {
                if (currentGame.team1.playerStats[this._id]) {
                    totalTossups += currentGame.team1.playerStats[this._id].gp * currentGame.tossupsheard;
                }
            } else if (currentGame.team2.team_id == this.teamID) {
                if (currentGame.team2.playerStats[this._id]) {
                    totalTossups += currentGame.team2.playerStats[this._id].gp * currentGame.tossupsheard;
                }
            }
        }
        return totalTossups;
}

playerSchema.methods.getTossupsHeardConstraint = function(tournament, bounds) {

        function isBelowMaxRound(game) {
            return game.round >= bounds.minRound && game.round <= bounds.maxRound;
        }

        var totalTossups = 0;
        var filteredGames = tournament.games.filter(isBelowMaxRound);

        for (var i = 0; i < filteredGames.length; i++) {
            var currentGame = filteredGames[i];
            if (currentGame.team1.team_id == this.teamID) {
                if (currentGame.team1.playerStats[this._id]) {
                    totalTossups += currentGame.team1.playerStats[this._id].gp * currentGame.tossupsheard;
                }
            } else if (currentGame.team2.team_id == this.teamID) {
                if (currentGame.team2.playerStats[this._id]) {
                    totalTossups += currentGame.team2.playerStats[this._id].gp * currentGame.tossupsheard;
                }
            }
        }
        return totalTossups;
}

playerSchema.methods.getPointsPerTossup = function(tournament) {
    if (this.getTossupsHeard(tournament) == 0) {
        return 0;
    }
    return this.getTotalPoints(tournament) / this.getTossupsHeard(tournament);
}

playerSchema.methods.getPowersToNegs = function(tournament) {
    if (this.getTossupsHeard(tournament) == 0) {
        return 0;
    }
    var negs = 0;
    var powers = 0;
    for (vals in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(vals) && this.pointValues[vals] != undefined) {
            if (tournament.pointsTypes[vals] && tournament.pointsTypes[vals] == "N") {
                negs += this.pointValues[vals];
            } else if (tournament.pointsTypes[vals] && tournament.pointsTypes[vals] == "P"){
                powers += this.pointValues[vals];
            }
        }
    }

    if (negs == 0) {
        return Infinity;
    } else {
        return powers / negs;
    }
}

playerSchema.methods.getGetsToNegs = function(tournament) {
    if (this.getTossupsHeard(tournament) == 0) {
        return 0;
    }
    var negs = 0;
    var gets = 0;
    for (vals in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(vals) && this.pointValues[vals] != undefined) {
            if (tournament.pointsTypes[vals] && tournament.pointsTypes[vals] == "N") {
                negs += this.pointValues[vals];
            } else if (tournament.pointsTypes[vals] && (tournament.pointsTypes[vals] == "P" || tournament.pointsTypes[vals] == "B")){
                gets += this.pointValues[vals];
            }
        }
    }
    if (negs == 0) {
        return Infinity;
    } else {
        return gets / negs;
    }
}



module.exports = mongoose.model("Player", playerSchema);
