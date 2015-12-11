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
                    pointValues[pv] += parseFloat(playerPoints[pv]);
                }
            }
        } else if (currentGame.team2.team_id == this.teamID && currentGame.team2.playerStats[this._id]) {
            var playerPoints = currentGame.team2.playerStats[this._id];
            for (var pv in tournament.pointScheme) {
                if (tournament.pointScheme.hasOwnProperty(pv) && playerPoints[pv]) {
                    pointValues[pv] += parseFloat(playerPoints[pv]);
                }
            }
        }
    }
    return pointValues;
}

playerSchema.methods.getTossupTotalsOneGame = function(game, tournament) {
    var pointValues = {};
    for (var pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    if (game.team1.team_id == this.teamID && game.team1.playerStats[this._id]) {
        var playerPoints = game.team1.playerStats[this._id];
        for (var pv in tournament.pointScheme) {
            if (playerPoints[pv] && tournament.pointScheme.hasOwnProperty(pv)) {
                pointValues[pv] = parseFloat(playerPoints[pv]);
            }
        }
    } else if (game.team2.team_id == this.teamID && game.team2.playerStats[this._id]) {
        var playerPoints = game.team2.playerStats[this._id];
        for (var pv in tournament.pointScheme) {
            if (tournament.pointScheme.hasOwnProperty(pv) && playerPoints[pv]) {
                pointValues[pv] = parseFloat(playerPoints[pv]);
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
                totalGames += parseFloat(playerPoints["gp"]);
            }
        } else if (currentGame.team2.team_id == this.teamID && currentGame.team2.playerStats[this._id]) {
            var playerPoints = currentGame.team2.playerStats[this._id];
            if (playerPoints["gp"]) {
                totalGames += parseFloat(playerPoints["gp"]);
            }
        }
    }
    return totalGames;
}

playerSchema.methods.getGamePlayedOneGame = function(game) {
    if (game.team1.team_id == this.teamID && game.team1.playerStats[this._id]) {
        var playerPoints = game.team1.playerStats[this._id];
        if (playerPoints["gp"]) {
            return parseFloat(playerPoints["gp"]);
        }
    } else if (game.team2.team_id == this.teamID && game.team2.playerStats[this._id]) {
        var playerPoints = game.team2.playerStats[this._id];
        if (playerPoints["gp"]) {
            return parseFloat(playerPoints["gp"]);
        }
    }
    return 0;
}

playerSchema.methods.getTotalPoints = function(tournament) {
    var total = 0;
    var pointTotals = this.getTotalPointValues(tournament);
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values)) {
            total += parseFloat(values) * parseFloat(pointTotals[values]);
        }
    }
    return total;
}

playerSchema.methods.getTotalPointsOneGame = function(game, tournament) {
    var total = 0;
    var pointTotals = this.getTossupTotalsOneGame(game, tournament);
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values)) {
            total += parseFloat(values) * parseFloat(pointTotals[values]);
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
                    totalTossups += parseFloat(currentGame.team1.playerStats[this._id].gp) * currentGame.tossupsheard;
                }
            } else if (currentGame.team2.team_id == this.teamID) {
                if (currentGame.team2.playerStats[this._id]) {
                    totalTossups += parseFloat(currentGame.team2.playerStats[this._id].gp) * currentGame.tossupsheard;
                }
            }
        }
        return totalTossups;
}

playerSchema.methods.getTossupHeardOneGame = function(game) {
    if (game.team1.team_id == this.teamID) {
        if (game.team1.playerStats[this._id]) {
            return parseFloat(game.team1.playerStats[this._id].gp) * game.tossupsheard;
        }
    } else if (game.team2.team_id == this.teamID) {
        if (game.team2.playerStats[this._id]) {
            return parseFloat(game.team2.playerStats[this._id].gp) * game.tossupsheard;
        }
    }
    return 0;
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
    
    return {id : this.shortID, stats : playerInfo};
}

playerSchema.methods.getAllGamesInformation = function(tournament) {
    var playedGames = [];
    for (var i = 0; i < tournament.games.length; i++) {
        var currentGame = tournament.games[i];
        if (currentGame.team1.team_id == this.teamID || currentGame.team2.team_id == this.teamID) {
            var formattedGame = this.formatGameInformation(currentGame, tournament);
            playedGames.push(formattedGame);
        }
    }
    playedGames.sort(function(first, second) {
        return first["Round"] - second["Round"];
    });
    return playedGames;
}

playerSchema.methods.formatGameInformation = function(game, tournament) {
    var gameinfo = {};
    gameinfo["Round"] = game.round;
    if (game.team1.team_id == this.teamID) {
        gameinfo["Opponent"] = game.team2.team_name;
        if (game.team1.score > game.team2.score) {
            gameinfo["Result"] = "W";
        } else if (game.team2.score > game.team1.score) {
            gameinfo["Result"] = "L";
        } else {
            gameinfo["Result"] = "T";
        }
    } else {
        gameinfo["Opponent"] = game.team1.team_name;
        if (game.team1.score > game.team2.score) {
            gameinfo["Result"] = "L";
        } else if (game.team2.score > game.team1.score) {
            gameinfo["Result"] = "W";
        } else {
            gameinfo["Result"] = "T";
        }
    }
    gameinfo["GP"] = this.getGamePlayedOneGame(game);
    gameinfo.pointValues = this.getTossupTotalsOneGame(game, tournament);
    gameinfo["TUH"] = this.getTossupHeardOneGame(game);
    gameinfo["Pts"] = this.getTotalPointsOneGame(game, tournament);
    return gameinfo;
}

module.exports = mongoose.model("Player", playerSchema);
