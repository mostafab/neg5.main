var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TeamSchema = require("./team").schema;

var playerSchema = new Schema({
    player_name : String,
    teamID : String,
    team_name : String,
    // gamesPlayed : {type : Number, default : 0},
    // pointValues : {type : {}},
    shortID : String
});

playerSchema.methods.getPointsPerGame = function(tournament) {
    var totalPoints = this.getTotalPoints(tournament);
    var games = this.getTotalGamesPlayed(tournament);
    if (games == 0) {
        return 0;
    }
    return +(totalPoints / games).toFixed(2);
}

playerSchema.methods.getTotalPointValues = function(tournament) {
    var pointValues = {};
    for (var pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this.teamID && currentGame.team1.playerStats[this._id]) {
            var playerPoints = currentGame.team1.playerStats[this._id];
            for (var pv in tournament.pointScheme) {
                if (playerPoints[pv] && tournament.pointScheme.hasOwnProperty(pv)) {
                    pointValues[pv] += parseInt(playerPoints[pv]);
                }
            }
        } else if (currentGame.team2.team_id == this.teamID && currentGame.team2.playerStats[this._id]) {
            var playerPoints = currentGame.team2.playerStats[this._id];
            for (var pv in tournament.pointScheme) {
                if (tournament.pointScheme.hasOwnProperty(pv) && playerPoints[pv]) {
                    pointValues[pv] += parseInt(playerPoints[pv]);
                }
            }
        }
    }
    return pointValues;
}

playerSchema.methods.getTotalGamesPlayed = function(tournament) {
    var totalGames = 0;
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this.teamID && currentGame.team1.playerStats[this._id]) {
            var playerPoints = currentGame.team1.playerStats[this._id];
            if (playerPoints["gp"]) {
                totalGames += parseInt(playerPoints["gp"]);
            }
        } else if (currentGame.team2.team_id == this.teamID && currentGame.team2.playerStats[this._id]) {
            var playerPoints = currentGame.team2.playerStats[this._id];
            if (playerPoints["gp"]) {
                totalGames += parseInt(playerPoints["gp"]);
            }
        }
    }
    return totalGames;
}

playerSchema.methods.getTotalPoints = function(tournament) {
    var total = 0;
    var pointTotals = this.getTotalPointValues(tournament);
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values)) {
            total += parseInt(values) * parseInt(pointTotals[values]);
        }
    }
    return total;
}

playerSchema.methods.getTossupsHeard = function(tournament) {
        var totalTossups = 0;
        for (var i = 0; i < tournament.games.length; i++) {
            var currentGame = tournament.games[i];
            if (currentGame.team1.team_id == this.teamID) {
                if (currentGame.team1.playerStats[this._id]) {
                    totalTossups += parseInt(currentGame.team1.playerStats[this._id].gp) * currentGame.tossupsheard;
                }
            } else if (currentGame.team2.team_id == this.teamID) {
                if (currentGame.team2.playerStats[this._id]) {
                    totalTossups += parseInt(currentGame.team2.playerStats[this._id].gp) * currentGame.tossupsheard;
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
    // if (this.getTossupsHeard(tournament) == 0) {
    //     return 0;
    // }
    // var negs = 0;
    // var powers = 0;
    // for (vals in tournament.pointScheme) {
    //     if (tournament.pointScheme.hasOwnProperty(vals) && this.pointValues[vals] != undefined) {
    //         if (tournament.pointsTypes[vals] && tournament.pointsTypes[vals] == "N") {
    //             negs += this.pointValues[vals];
    //         } else if (tournament.pointsTypes[vals] && tournament.pointsTypes[vals] == "P"){
    //             powers += this.pointValues[vals];
    //         }
    //     }
    // }
    //
    // if (negs == 0) {
    //     return Infinity;
    // } else {
    //     return powers / negs;
    // }
}

playerSchema.methods.getGetsToNegs = function(tournament) {
    // if (this.getTossupsHeard(tournament) == 0) {
    //     return 0;
    // }
    // var negs = 0;
    // var gets = 0;
    // for (vals in tournament.pointScheme) {
    //     if (tournament.pointScheme.hasOwnProperty(vals) && this.pointValues[vals] != undefined) {
    //         if (tournament.pointsTypes[vals] && tournament.pointsTypes[vals] == "N") {
    //             negs += this.pointValues[vals];
    //         } else if (tournament.pointsTypes[vals] && (tournament.pointsTypes[vals] == "P" || tournament.pointsTypes[vals] == "B")){
    //             gets += this.pointValues[vals];
    //         }
    //     }
    // }
    // if (negs == 0) {
    //     return Infinity;
    // } else {
    //     return gets / negs;
    // }
}

playerSchema.methods.getAllInformation = function(tournament) {
    var playerInfo = {};
    var pointTotals = this.getTotalPointValues(tournament);
    playerInfo["Player"] = this.player_name;
    playerInfo["Team"] = this.team_name;
    playerInfo["GP"] = this.getTotalGamesPlayed(tournament);
    playerInfo.pointTotals = pointTotals;
    playerInfo["TUH"] = this.getTossupsHeard(tournament);
    playerInfo["Pts"] = this.getTotalPoints(tournament);
    playerInfo["PPG"] = this.getPointsPerGame(tournament);

    return playerInfo;
}

module.exports = mongoose.model("Player", playerSchema);
