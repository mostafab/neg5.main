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

teamSchema.methods.getPointsPerGame = function(tournament) {
    totalPoints = 0;
    totalGames = 0;
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team1.score;
            totalGames++;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team2.score;
            totalGames++;
        }
    }
    if (totalGames == 0) {
        return 0;
    } else {
        return totalPoints / totalGames;
    }
}

teamSchema.methods.getOpponentPPG = function(tournament) {
    totalPoints = 0;
    totalGames = 0;
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team2.score;
            totalGames++;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team1.score;
            totalGames++;
        }
    }
    if (totalGames == 0) {
        return 0;
    } else {
        return totalPoints / totalGames;
    }
}

teamSchema.methods.getTossupTotals = function(tournament) {
    var pointTotals = {};
    for (var pointValue in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
            pointTotals[pointValue] = 0;
        }
    }
    for (var i = 0; i < tournament.players.length; i++) {
        var currentPlayer = tournament.players[i];
        if (currentPlayer.teamID == this._id) {
            for (var pointValue in tournament.pointScheme) {
                if (tournament.pointScheme.hasOwnProperty(pointValue) && currentPlayer.pointValues[pointValue] != undefined) {
                    pointTotals[pointValue] += currentPlayer.pointValues[pointValue];
                }
            }
        }
    }
    return pointTotals;
}

teamSchema.methods.getTotalBonusPoints = function(tournament) {
    var pointTotals = this.getTossupTotals(tournament);
    var totalPoints = 0;
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team1.score - currentGame.team1.bouncebacks;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team2.score - currentGame.team2.bouncebacks;
        }
    }
    for (var point in pointTotals) {
        if (pointTotals.hasOwnProperty(point)) {
            totalPoints -= parseInt(point) * parseInt(pointTotals[point]);
        }
    }
    return totalPoints;
}

teamSchema.methods.getTotalGets = function(tournament) {
    var pointTotals = this.getTossupTotals(tournament);
    var totalGets = 0;
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values) && tournament.pointsTypes[values] != "N") {
            totalGets += pointTotals[values];
        }
    }
    return totalGets;
}

teamSchema.methods.getTotalNegs = function(tournament) {
    var pointTotals = this.getTossupTotals(tournament);
    var totalNegs = 0;
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values) && tournament.pointsTypes[values] == "N") {
            totalNegs += pointTotals[values];
        }
    }
    return totalNegs;
}

teamSchema.methods.getTossupsHeard = function(tournament) {
    totalTossups = 0;
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this._id || currentGame.team2.team_id == this._id) {
            totalTossups += currentGame.tossupsheard;
        }
    }
    return totalTossups;
}

teamSchema.methods.getOverallPPB = function(tournament) {
    var totalBonusPoints = this.getTotalBonusPoints(tournament);
    var totalGets = this.getTotalGets(tournament);
    if (totalGets == 0) {
        return 0;
    }
    return totalBonusPoints / totalGets;
}

teamSchema.methods.getAverageMarginOfVictory = function(tournament) {
    return this.getPointsPerGame(tournament) - this.getOpponentPPG(tournament);
}

module.exports = mongoose.model("Team", teamSchema);
