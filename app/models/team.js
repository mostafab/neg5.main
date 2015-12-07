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
    var totalBonusPoints = 0;
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this._id) {

        } else if (currentGame.team2.team_id == this._id) {

        }
    }
    return totalBonusPoints;
}

teamSchema.getAverageMarginOfVictory = function(tournament) {
    return this.getPointsPerGame(tournament) - this.getOpponentPPG(tournament);
}

module.exports = mongoose.model("Team", teamSchema);
