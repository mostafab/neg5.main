var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var playerSchema = require("./player").schema;

var teamSchema = new Schema({
    team_name : String,
    division : String,
    // wins : {type : Number, default : 0},
    // losses : {type : Number, default : 0},
    // ties : {type : Number, default : 0},
    shortID : String
});

teamSchema.methods.getRecord = function(tournament) {
    var record = {"wins" : 0, "losses" : 0, "ties" : 0};
    for (var i = 0; i < tournament.games.length; i++) {
        var current = tournament.games[i];
        if ((current.team1.team_id == this._id && current.team1.score > current.team2.score)
                || (current.team2.team_id == this._id && current.team2.score > current.team1.score)) {
            record.wins++;
        } else if ((current.team1.team_id == this._id && current.team1.score < current.team2.score)
                || (current.team2.team_id == this._id && current.team2.score < current.team1.score)) {
            record.losses++;
        } else if ((current.team1.team_id == this._id && current.team1.score == current.team2.score)
                || (current.team2.team_id == this._id && current.team2.score == current.team1.score)) {
            record.ties++;
        }
    }
    return record;
}

teamSchema.methods.getWinPercentage = function(record) {
    if (record.wins + record.losses == 0) {
        return 0;
    } else {
        return +(record.wins / (record.wins + record.losses)).toFixed(3);
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
        return (totalPoints / totalGames).toFixed(2);
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
        return +(totalPoints / totalGames).toFixed(2);
    }
}

teamSchema.methods.getTossupTotals = function(tournament) {
    var pointTotals = {};
    for (var pointValue in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
            pointTotals[pointValue] = 0;
        }
    }
    // for (var i = 0; i < tournament.players.length; i++) {
    //     var currentPlayer = tournament.players[i];
    //     if (currentPlayer.teamID == this._id) {
    //         for (var pointValue in tournament.pointScheme) {
    //             if (tournament.pointScheme.hasOwnProperty(pointValue) && currentPlayer.pointValues && currentPlayer.pointValues[pointValue] != null) {
    //                 pointTotals[pointValue] += currentPlayer.pointValues[pointValue];
    //             }
    //         }
    //     }
    // }
    for (var i = 0; i < tournament.games.length; i++) {
        var current = tournament.games[i];
        if (current.team1.team_id == this._id && current.team1.playerStats) {
            for (var player in current.team1.playerStats) {
                if (current.team1.playerStats.hasOwnProperty(player)) {
                    var stats = current.team1.playerStats[player];
                    for (var pointValue in tournament.pointScheme) {
                        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
                            if (stats[pointValue] && pointTotals[pointValue] != undefined) {
                                pointTotals[pointValue] += parseInt(stats[pointValue]);
                            }
                        }
                    }
                }
            }
        } else if (current.team2.team_id == this._id && current.team2.playerStats) {
            for (var player in current.team2.playerStats) {
                if (current.team2.playerStats.hasOwnProperty(player)) {
                    var stats = current.team2.playerStats[player];
                    for (var pointValue in tournament.pointScheme) {
                        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
                            if (stats[pointValue] && pointTotals[pointValue] != undefined) {
                                pointTotals[pointValue] += parseInt(stats[pointValue]);
                            }
                        }
                    }
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
    console.log("Gets: " + totalGets);
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
    return +(totalBonusPoints / totalGets).toFixed(2);
}

teamSchema.methods.getAverageMarginOfVictory = function(tournament) {
    return +(this.getPointsPerGame(tournament) - this.getOpponentPPG(tournament)).toFixed(3);
}

teamSchema.methods.getTotalBouncebackPoints = function(tournament) {
    var totalBouncebackPoints = 0;
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this._id) {
            totalBouncebackPoints += currentGame.team1.bouncebacks;
        } else if (currentGame.team2.team_id == this._id) {
            totalBouncebackPoints += currentGame.team2.bouncebacks;
        }
    }
    return totalBouncebackPoints;
}

teamSchema.methods.getAverageInformation = function(tournament) {
    var record = this.getRecord(tournament);
    var teamInfo = {};
    teamInfo["Team"] = this.team_name;
    teamInfo["Division"] = this.division;
    teamInfo["W"] = record.wins;
    teamInfo["L"] = record.losses;
    teamInfo["T"] = record.ties;
    teamInfo["Win %"] = this.getWinPercentage(record);
    teamInfo["PPG"] = this.getPointsPerGame(tournament);
    teamInfo["PAPG"] = this.getOpponentPPG(tournament);
    teamInfo["Margin"] = this.getAverageMarginOfVictory(tournament);
    teamInfo.pointTotals = this.getTossupTotals(tournament);
    teamInfo["TUH"] = this.getTossupsHeard(tournament);
    teamInfo["Bonus Points"] = this.getTotalBonusPoints(tournament);
    teamInfo["PPB"]= this.getOverallPPB(tournament);

    return teamInfo;
}

module.exports = mongoose.model("Team", teamSchema);
