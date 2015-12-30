var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TeamSchema = require("./team").schema;

/**
* Schema for a player stored in a database.
* Each player has a name, a teamID to link to the team and the team's name
*/
var playerSchema = new Schema({
    player_name : String,
    teamID : String,
    team_name : String,
    // gamesPlayed : {type : Number, default : 0},
    // pointValues : {type : {}},
    shortID : String
});

/**
* Get a player's points per game
* @param tournament tournament to check
* @return ppg for a player
*/
playerSchema.methods.getPointsPerGame = function(tournament) {
    var totalPoints = this.getTotalPoints(tournament);
    var games = this.getTotalGamesPlayed(tournament);
    if (games == 0) {
        return 0;
    }
    return +(totalPoints / games).toFixed(2);
}

/**
* Gets a player's points per game given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return ppg for a player
*/
playerSchema.methods.getPointsPerGameFiltered = function(tournament, constraints) {
    var totalPoints = this.getTotalPointsFiltered(tournament, constraints);
    var games = this.getTotalGamesPlayedFiltered(tournament, constraints);
    if (games == 0) {
        return 0;
    }
    return +(totalPoints / games).toFixed(2);
}

/**
* Returns a player's total point values as a Javascript object, e.g. {15 : 1, 10 : 2 : -5 : 23}
* @param tournament tournament to check
* @return a player's total point values
*/
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

/**
* Returns a player's total point values as a Javascript object, e.g. {15 : 1, 10 : 2 : -5 : 23}
* given constraints
* @param tournament tournament to check
* @param constraints limits on rounds to check
* @return a player's total point values
*/
playerSchema.methods.getTotalPointValuesFiltered = function(tournament, constraints) {
    var pointValues = {}
    for (var pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    var filteredGames = tournament.games.filter(function(game) {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    for (var i = 0; i < filteredGames.length; i++) {
        var currentGame = filteredGames[i];
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

/**
* Gets a player's total tossups for one game as Javascript object
* @param game game to check
* @param tournament tournament to check
* @return tossup totals for a game
*/
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

/**
* Get a player's total game's played
* @param tournament tournament to check
* @return a player's total games
*/
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

/**
* Get a player's total game's played given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return a player's total games
*/
playerSchema.methods.getTotalGamesPlayedFiltered = function(tournament, constraints) {
    var totalGames = 0;
    var filteredGames = tournament.games.filter(function(game) {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    for (var i = 0; i < filteredGames.length; i++) {
        var currentGame = filteredGames[i];
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

/**
* Get's a player's game played for one game
* @param game game to check
* @return game played
*/
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

/**
* Get a player's total points
* @param tournament tournament to check
* @return player's total points
*/
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

/**
* Gets a player's total points given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return player's total point values
*/
playerSchema.methods.getTotalPointsFiltered = function(tournament, constraints) {
    var total = 0;
    var pointTotals = this.getTotalPointValuesFiltered(tournament, constraints);
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values)) {
            total += parseFloat(values) * parseFloat(pointTotals[values]);
        }
    }
    return total;
}

/**
* Gets a player's points for one game
* @param game game to check
* @param tournament tournament to check
* @return player's point total for one game
*/
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

/**
* Gets a player's total tossups heard
* @param tournament tournament to check
* @return total tossups heard
*/
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

/**
* Gets a player's total tossups heard given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return tossups heard
*/
playerSchema.methods.getTossupsHeardFiltered = function(tournament, constraints) {
    var totalTossups = 0;
    var filteredGames = tournament.games.filter(function(game) {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    for (var i = 0; i < filteredGames.length; i++) {
        var currentGame = filteredGames[i];
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

/**
* Gets a player's total tosusps for one game
* @param game game to check
* @return tossups heard
*/
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

/**
* Gets a player's tossups heard given constraints
* @param tournament tournament to check
* @param bounds limits on rounds
*/
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

/**
* Gets a player's points per tossup
* @param tournament tournament to check
* @return points per tossup
*/
playerSchema.methods.getPointsPerTossup = function(tournament) {
    if (this.getTossupsHeard(tournament) == 0) {
        return 0;
    }
    return this.getTotalPoints(tournament) / this.getTossupsHeard(tournament);
}

/**
* Returns all statistics information about a player in a javascript object
* @param tournament tournament to check
* @return all statistics information about a player
*/
playerSchema.methods.getAllInformation = function(tournament) {
    var playerInfo = {};
    playerInfo["Player"] = this.player_name;
    playerInfo["Team"] = this.team_name;
    playerInfo["GP"] = this.getTotalGamesPlayed(tournament);
    playerInfo.pointTotals = this.getTotalPointValues(tournament);
    playerInfo["TUH"] = this.getTossupsHeard(tournament);
    playerInfo["Pts"] = this.getTotalPoints(tournament);
    playerInfo["PPG"] = this.getPointsPerGame(tournament);

    return {id : this.shortID, stats : playerInfo};
}

/**
* Returns all statistics information about a player in a javascript object given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return all statistics information about a player
*/
playerSchema.methods.getAllInformationFiltered = function(tournament, constraints) {
    var playerInfo = {};
    playerInfo["Player"] = this.player_name;
    playerInfo["Team"] = this.team_name;
    playerInfo["GP"] = this.getTotalGamesPlayedFiltered(tournament, constraints);
    playerInfo.pointTotals = this.getTotalPointValuesFiltered(tournament, constraints);
    playerInfo["TUH"] = this.getTossupsHeardFiltered(tournament, constraints);
    playerInfo["Pts"] = this.getTotalPointsFiltered(tournament, constraints);
    playerInfo["PPG"] = this.getPointsPerGameFiltered(tournament, constraints);
    return {id : this.shortID, stats : playerInfo};
}

/**
* Returns all information about a player's games as an array
* @param tournament tournament to check
* @return array of information about player's games
*/
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

/**
* Format's one game's information for a player
* @param game game to check
* @param tournament tournament to check
* @return information about a single game
*/
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

/**
* Gets all of a player's game information
* @param tournament tournament to check
* @return statistics information about a player
*/
playerSchema.methods.getTotalGameStats = function(tournament) {
    var stats = this.getAllInformation(tournament).stats;
    return stats;
}

module.exports = mongoose.model("Player", playerSchema);
