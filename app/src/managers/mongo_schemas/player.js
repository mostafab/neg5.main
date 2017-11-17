'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TeamSchema = require("./team").schema;

/**
* Schema for a player stored in a database.
* Each player has a name, a teamID to link to the team and the team's name
*/
const playerSchema = new Schema({
    player_name : {type : String, required : true},
    teamID : {type : String, required : true},
    shortID : {type : String, required : true}
});

/**
* Get a player's points per game
* @param tournament tournament to check
* @return ppg for a player
*/
playerSchema.methods.getPointsPerGame = function(tournament) {
    const totalPoints = this.getTotalPoints(tournament);
    const games = this.getTotalGamesPlayed(tournament);
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
    const totalPoints = this.getTotalPointsFiltered(tournament, constraints);
    const games = this.getTotalGamesPlayedFiltered(tournament, constraints);
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
    const pointValues = {};
    for (let pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this.teamID && currentGame.team1.playerStats[this._id]) {
            const playerPoints = currentGame.team1.playerStats[this._id];
            for (let pv in tournament.pointScheme) {
                if (playerPoints[pv] && tournament.pointScheme.hasOwnProperty(pv)) {
                    pointValues[pv] += parseFloat(playerPoints[pv]);
                }
            }
        } else if (currentGame.team2.team_id == this.teamID && currentGame.team2.playerStats[this._id]) {
            const playerPoints = currentGame.team2.playerStats[this._id];
            for (let pv in tournament.pointScheme) {
                if (tournament.pointScheme.hasOwnProperty(pv) && playerPoints[pv]) {
                    pointValues[pv] += parseFloat(playerPoints[pv]);
                }
            }
        }
    });
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
    const pointValues = {}
    for (let pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this.teamID && currentGame.team1.playerStats[this._id]) {
            const playerPoints = currentGame.team1.playerStats[this._id];
            for (let pv in tournament.pointScheme) {
                if (playerPoints[pv] && tournament.pointScheme.hasOwnProperty(pv)) {
                    pointValues[pv] += parseFloat(playerPoints[pv]);
                }
            }
        } else if (currentGame.team2.team_id == this.teamID && currentGame.team2.playerStats[this._id]) {
            const playerPoints = currentGame.team2.playerStats[this._id];
            for (let pv in tournament.pointScheme) {
                if (tournament.pointScheme.hasOwnProperty(pv) && playerPoints[pv]) {
                    pointValues[pv] += parseFloat(playerPoints[pv]);
                }
            }
        }
    });
    return pointValues;
}

/**
* Gets a player's total tossups for one game as Javascript object
* @param game game to check
* @param tournament tournament to check
* @return tossup totals for a game
*/
playerSchema.methods.getTossupTotalsOneGame = function(game, tournament) {
    const pointValues = {};
    for (let pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    if (game.team1.team_id == this.teamID && game.team1.playerStats[this._id]) {
        const playerPoints = game.team1.playerStats[this._id];
        for (let pv in tournament.pointScheme) {
            if (playerPoints[pv] && tournament.pointScheme.hasOwnProperty(pv)) {
                pointValues[pv] = parseFloat(playerPoints[pv]);
            }
        }
    } else if (game.team2.team_id == this.teamID && game.team2.playerStats[this._id]) {
        const playerPoints = game.team2.playerStats[this._id];
        for (let pv in tournament.pointScheme) {
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
    let totalGames = 0;
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this.teamID && currentGame.team1.playerStats[this._id]) {
            const playerPoints = currentGame.team1.playerStats[this._id];
            if (playerPoints["gp"]) {
                totalGames += parseFloat(playerPoints["gp"]);
            }
        } else if (currentGame.team2.team_id == this.teamID && currentGame.team2.playerStats[this._id]) {
            const playerPoints = currentGame.team2.playerStats[this._id];
            if (playerPoints["gp"]) {
                totalGames += parseFloat(playerPoints["gp"]);
            }
        }
    });
    return totalGames;
}

/**
* Get a player's total game's played given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return a player's total games
*/
playerSchema.methods.getTotalGamesPlayedFiltered = function(tournament, constraints) {
    let totalGames = 0;
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this.teamID && currentGame.team1.playerStats[this._id]) {
            const playerPoints = currentGame.team1.playerStats[this._id];
            if (playerPoints["gp"]) {
                totalGames += parseFloat(playerPoints["gp"]);
            }
        } else if (currentGame.team2.team_id == this.teamID && currentGame.team2.playerStats[this._id]) {
            const playerPoints = currentGame.team2.playerStats[this._id];
            if (playerPoints["gp"]) {
                totalGames += parseFloat(playerPoints["gp"]);
            }
        }
    });
    return totalGames;
}

/**
* Get's a player's game played for one game
* @param game game to check
* @return game played
*/
playerSchema.methods.getGamePlayedOneGame = function(game) {
    if (game.team1.team_id == this.teamID && game.team1.playerStats[this._id]) {
        const playerPoints = game.team1.playerStats[this._id];
        if (playerPoints["gp"]) {
            return parseFloat(playerPoints["gp"]);
        }
    } else if (game.team2.team_id == this.teamID && game.team2.playerStats[this._id]) {
        const playerPoints = game.team2.playerStats[this._id];
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
    let total = 0;
    const pointTotals = this.getTotalPointValues(tournament);
    for (let values in pointTotals) {
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
    let total = 0;
    const pointTotals = this.getTotalPointValuesFiltered(tournament, constraints);
    for (let values in pointTotals) {
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
    let total = 0;
    const pointTotals = this.getTossupTotalsOneGame(game, tournament);
    for (let values in pointTotals) {
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
    let totalTossups = 0;
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this.teamID) {
            if (currentGame.team1.playerStats[this._id]) {
                totalTossups += parseFloat(currentGame.team1.playerStats[this._id].gp) * currentGame.tossupsheard;
            }
        } else if (currentGame.team2.team_id == this.teamID) {
            if (currentGame.team2.playerStats[this._id]) {
                totalTossups += parseFloat(currentGame.team2.playerStats[this._id].gp) * currentGame.tossupsheard;
            }
        }
    });
    return totalTossups;
}

/**
* Gets a player's total tossups heard given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return tossups heard
*/
playerSchema.methods.getTossupsHeardFiltered = function(tournament, constraints) {
    let totalTossups = 0;
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this.teamID) {
            if (currentGame.team1.playerStats[this._id]) {
                totalTossups += parseFloat(currentGame.team1.playerStats[this._id].gp) * currentGame.tossupsheard;
            }
        } else if (currentGame.team2.team_id == this.teamID) {
            if (currentGame.team2.playerStats[this._id]) {
                totalTossups += parseFloat(currentGame.team2.playerStats[this._id].gp) * currentGame.tossupsheard;
            }
        }
    });
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
    let totalTossups = 0;
    let filteredGames = tournament.games.filter(isBelowMaxRound);
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this.teamID) {
            if (currentGame.team1.playerStats[this._id]) {
                totalTossups += currentGame.team1.playerStats[this._id].gp * currentGame.tossupsheard;
            }
        } else if (currentGame.team2.team_id == this.teamID) {
            if (currentGame.team2.playerStats[this._id]) {
                totalTossups += currentGame.team2.playerStats[this._id].gp * currentGame.tossupsheard;
            }
        }
    });
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
playerSchema.methods.getAllInformation = function(tournament, teamMap) {
    const playerInfo = {};
    playerInfo["Player"] = this.player_name;
    playerInfo["Team"] = teamMap[this.teamID].name;
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
playerSchema.methods.getAllInformationFiltered = function(tournament, constraints, teamMap) {
    const playerInfo = {};
    playerInfo["Player"] = this.player_name;
    playerInfo["Team"] = teamMap[this.teamID].name;
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
playerSchema.methods.getAllGamesInformation = function(tournament, teamMap) {
    const playedGames = [];
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this.teamID || currentGame.team2.team_id == this.teamID) {
            const formattedGame = this.formatGameInformation(currentGame, tournament, teamMap);
            playedGames.push(formattedGame);
        }
    });
    playedGames.sort((first, second) => {
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
playerSchema.methods.formatGameInformation = function(game, tournament, teamMap) {
    const gameinfo = {};
    gameinfo["Round"] = game.round;
    if (game.team1.team_id == this.teamID) {
        gameinfo["Opponent"] = teamMap[game.team2.team_id].name;
        if (game.team1.score > game.team2.score) {
            gameinfo["Result"] = "W";
        } else if (game.team2.score > game.team1.score) {
            gameinfo["Result"] = "L";
        } else {
            gameinfo["Result"] = "T";
        }
    } else {
        gameinfo["Opponent"] = teamMap[game.team1.team_id].name;
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
playerSchema.methods.getTotalGameStats = function(tournament, teamMap) {
    return this.getAllInformation(tournament, teamMap).stats;
}

module.exports = mongoose.model("Player", playerSchema);
