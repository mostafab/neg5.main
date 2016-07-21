'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TeamSchema = require("./team").schema;

/**
* Schema for a player stored in a database.
* Each player has a name, a teamID to link to the team and the team's name
*/
var playerSchema = new Schema({
    player_name: { type: String, required: true },
    teamID: { type: String, required: true },
    shortID: { type: String, required: true }
});

/**
* Get a player's points per game
* @param tournament tournament to check
* @return ppg for a player
*/
playerSchema.methods.getPointsPerGame = function (tournament) {
    var totalPoints = this.getTotalPoints(tournament);
    var games = this.getTotalGamesPlayed(tournament);
    if (games == 0) {
        return 0;
    }
    return +(totalPoints / games).toFixed(2);
};

/**
* Gets a player's points per game given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return ppg for a player
*/
playerSchema.methods.getPointsPerGameFiltered = function (tournament, constraints) {
    var totalPoints = this.getTotalPointsFiltered(tournament, constraints);
    var games = this.getTotalGamesPlayedFiltered(tournament, constraints);
    if (games == 0) {
        return 0;
    }
    return +(totalPoints / games).toFixed(2);
};

/**
* Returns a player's total point values as a Javascript object, e.g. {15 : 1, 10 : 2 : -5 : 23}
* @param tournament tournament to check
* @return a player's total point values
*/
playerSchema.methods.getTotalPointValues = function (tournament) {
    var _this = this;

    var pointValues = {};
    for (var pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    tournament.games.forEach(function (currentGame) {
        if (currentGame.team1.team_id == _this.teamID && currentGame.team1.playerStats[_this._id]) {
            var playerPoints = currentGame.team1.playerStats[_this._id];
            for (var _pv in tournament.pointScheme) {
                if (playerPoints[_pv] && tournament.pointScheme.hasOwnProperty(_pv)) {
                    pointValues[_pv] += parseFloat(playerPoints[_pv]);
                }
            }
        } else if (currentGame.team2.team_id == _this.teamID && currentGame.team2.playerStats[_this._id]) {
            var _playerPoints = currentGame.team2.playerStats[_this._id];
            for (var _pv2 in tournament.pointScheme) {
                if (tournament.pointScheme.hasOwnProperty(_pv2) && _playerPoints[_pv2]) {
                    pointValues[_pv2] += parseFloat(_playerPoints[_pv2]);
                }
            }
        }
    });
    return pointValues;
};

/**
* Returns a player's total point values as a Javascript object, e.g. {15 : 1, 10 : 2 : -5 : 23}
* given constraints
* @param tournament tournament to check
* @param constraints limits on rounds to check
* @return a player's total point values
*/
playerSchema.methods.getTotalPointValuesFiltered = function (tournament, constraints) {
    var _this2 = this;

    var pointValues = {};
    for (var pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    var filteredGames = tournament.games.filter(function (game) {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(function (currentGame) {
        if (currentGame.team1.team_id == _this2.teamID && currentGame.team1.playerStats[_this2._id]) {
            var playerPoints = currentGame.team1.playerStats[_this2._id];
            for (var _pv3 in tournament.pointScheme) {
                if (playerPoints[_pv3] && tournament.pointScheme.hasOwnProperty(_pv3)) {
                    pointValues[_pv3] += parseFloat(playerPoints[_pv3]);
                }
            }
        } else if (currentGame.team2.team_id == _this2.teamID && currentGame.team2.playerStats[_this2._id]) {
            var _playerPoints2 = currentGame.team2.playerStats[_this2._id];
            for (var _pv4 in tournament.pointScheme) {
                if (tournament.pointScheme.hasOwnProperty(_pv4) && _playerPoints2[_pv4]) {
                    pointValues[_pv4] += parseFloat(_playerPoints2[_pv4]);
                }
            }
        }
    });
    return pointValues;
};

/**
* Gets a player's total tossups for one game as Javascript object
* @param game game to check
* @param tournament tournament to check
* @return tossup totals for a game
*/
playerSchema.methods.getTossupTotalsOneGame = function (game, tournament) {
    var pointValues = {};
    for (var pv in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pv)) {
            pointValues[pv] = 0;
        }
    }
    if (game.team1.team_id == this.teamID && game.team1.playerStats[this._id]) {
        var playerPoints = game.team1.playerStats[this._id];
        for (var _pv5 in tournament.pointScheme) {
            if (playerPoints[_pv5] && tournament.pointScheme.hasOwnProperty(_pv5)) {
                pointValues[_pv5] = parseFloat(playerPoints[_pv5]);
            }
        }
    } else if (game.team2.team_id == this.teamID && game.team2.playerStats[this._id]) {
        var _playerPoints3 = game.team2.playerStats[this._id];
        for (var _pv6 in tournament.pointScheme) {
            if (tournament.pointScheme.hasOwnProperty(_pv6) && _playerPoints3[_pv6]) {
                pointValues[_pv6] = parseFloat(_playerPoints3[_pv6]);
            }
        }
    }
    return pointValues;
};

/**
* Get a player's total game's played
* @param tournament tournament to check
* @return a player's total games
*/
playerSchema.methods.getTotalGamesPlayed = function (tournament) {
    var _this3 = this;

    var totalGames = 0;
    tournament.games.forEach(function (currentGame) {
        if (currentGame.team1.team_id == _this3.teamID && currentGame.team1.playerStats[_this3._id]) {
            var playerPoints = currentGame.team1.playerStats[_this3._id];
            if (playerPoints["gp"]) {
                totalGames += parseFloat(playerPoints["gp"]);
            }
        } else if (currentGame.team2.team_id == _this3.teamID && currentGame.team2.playerStats[_this3._id]) {
            var _playerPoints4 = currentGame.team2.playerStats[_this3._id];
            if (_playerPoints4["gp"]) {
                totalGames += parseFloat(_playerPoints4["gp"]);
            }
        }
    });
    return totalGames;
};

/**
* Get a player's total game's played given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return a player's total games
*/
playerSchema.methods.getTotalGamesPlayedFiltered = function (tournament, constraints) {
    var _this4 = this;

    var totalGames = 0;
    var filteredGames = tournament.games.filter(function (game) {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(function (currentGame) {
        if (currentGame.team1.team_id == _this4.teamID && currentGame.team1.playerStats[_this4._id]) {
            var playerPoints = currentGame.team1.playerStats[_this4._id];
            if (playerPoints["gp"]) {
                totalGames += parseFloat(playerPoints["gp"]);
            }
        } else if (currentGame.team2.team_id == _this4.teamID && currentGame.team2.playerStats[_this4._id]) {
            var _playerPoints5 = currentGame.team2.playerStats[_this4._id];
            if (_playerPoints5["gp"]) {
                totalGames += parseFloat(_playerPoints5["gp"]);
            }
        }
    });
    return totalGames;
};

/**
* Get's a player's game played for one game
* @param game game to check
* @return game played
*/
playerSchema.methods.getGamePlayedOneGame = function (game) {
    if (game.team1.team_id == this.teamID && game.team1.playerStats[this._id]) {
        var playerPoints = game.team1.playerStats[this._id];
        if (playerPoints["gp"]) {
            return parseFloat(playerPoints["gp"]);
        }
    } else if (game.team2.team_id == this.teamID && game.team2.playerStats[this._id]) {
        var _playerPoints6 = game.team2.playerStats[this._id];
        if (_playerPoints6["gp"]) {
            return parseFloat(_playerPoints6["gp"]);
        }
    }
    return 0;
};

/**
* Get a player's total points
* @param tournament tournament to check
* @return player's total points
*/
playerSchema.methods.getTotalPoints = function (tournament) {
    var total = 0;
    var pointTotals = this.getTotalPointValues(tournament);
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values)) {
            total += parseFloat(values) * parseFloat(pointTotals[values]);
        }
    }
    return total;
};

/**
* Gets a player's total points given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return player's total point values
*/
playerSchema.methods.getTotalPointsFiltered = function (tournament, constraints) {
    var total = 0;
    var pointTotals = this.getTotalPointValuesFiltered(tournament, constraints);
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values)) {
            total += parseFloat(values) * parseFloat(pointTotals[values]);
        }
    }
    return total;
};

/**
* Gets a player's points for one game
* @param game game to check
* @param tournament tournament to check
* @return player's point total for one game
*/
playerSchema.methods.getTotalPointsOneGame = function (game, tournament) {
    var total = 0;
    var pointTotals = this.getTossupTotalsOneGame(game, tournament);
    for (var values in pointTotals) {
        if (pointTotals.hasOwnProperty(values)) {
            total += parseFloat(values) * parseFloat(pointTotals[values]);
        }
    }
    return total;
};

/**
* Gets a player's total tossups heard
* @param tournament tournament to check
* @return total tossups heard
*/
playerSchema.methods.getTossupsHeard = function (tournament) {
    var _this5 = this;

    var totalTossups = 0;
    tournament.games.forEach(function (currentGame) {
        if (currentGame.team1.team_id == _this5.teamID) {
            if (currentGame.team1.playerStats[_this5._id]) {
                totalTossups += parseFloat(currentGame.team1.playerStats[_this5._id].gp) * currentGame.tossupsheard;
            }
        } else if (currentGame.team2.team_id == _this5.teamID) {
            if (currentGame.team2.playerStats[_this5._id]) {
                totalTossups += parseFloat(currentGame.team2.playerStats[_this5._id].gp) * currentGame.tossupsheard;
            }
        }
    });
    return totalTossups;
};

/**
* Gets a player's total tossups heard given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return tossups heard
*/
playerSchema.methods.getTossupsHeardFiltered = function (tournament, constraints) {
    var _this6 = this;

    var totalTossups = 0;
    var filteredGames = tournament.games.filter(function (game) {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(function (currentGame) {
        if (currentGame.team1.team_id == _this6.teamID) {
            if (currentGame.team1.playerStats[_this6._id]) {
                totalTossups += parseFloat(currentGame.team1.playerStats[_this6._id].gp) * currentGame.tossupsheard;
            }
        } else if (currentGame.team2.team_id == _this6.teamID) {
            if (currentGame.team2.playerStats[_this6._id]) {
                totalTossups += parseFloat(currentGame.team2.playerStats[_this6._id].gp) * currentGame.tossupsheard;
            }
        }
    });
    return totalTossups;
};

/**
* Gets a player's total tosusps for one game
* @param game game to check
* @return tossups heard
*/
playerSchema.methods.getTossupHeardOneGame = function (game) {
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
};

/**
* Gets a player's tossups heard given constraints
* @param tournament tournament to check
* @param bounds limits on rounds
*/
playerSchema.methods.getTossupsHeardConstraint = function (tournament, bounds) {
    var _this7 = this;

    function isBelowMaxRound(game) {
        return game.round >= bounds.minRound && game.round <= bounds.maxRound;
    }
    var totalTossups = 0;
    var filteredGames = tournament.games.filter(isBelowMaxRound);
    filteredGames.forEach(function (currentGame) {
        if (currentGame.team1.team_id == _this7.teamID) {
            if (currentGame.team1.playerStats[_this7._id]) {
                totalTossups += currentGame.team1.playerStats[_this7._id].gp * currentGame.tossupsheard;
            }
        } else if (currentGame.team2.team_id == _this7.teamID) {
            if (currentGame.team2.playerStats[_this7._id]) {
                totalTossups += currentGame.team2.playerStats[_this7._id].gp * currentGame.tossupsheard;
            }
        }
    });
    return totalTossups;
};

/**
* Gets a player's points per tossup
* @param tournament tournament to check
* @return points per tossup
*/
playerSchema.methods.getPointsPerTossup = function (tournament) {
    if (this.getTossupsHeard(tournament) == 0) {
        return 0;
    }
    return this.getTotalPoints(tournament) / this.getTossupsHeard(tournament);
};

/**
* Returns all statistics information about a player in a javascript object
* @param tournament tournament to check
* @return all statistics information about a player
*/
playerSchema.methods.getAllInformation = function (tournament, teamMap) {
    var playerInfo = {};
    playerInfo["Player"] = this.player_name;
    playerInfo["Team"] = teamMap[this.teamID].name;
    playerInfo["GP"] = this.getTotalGamesPlayed(tournament);
    playerInfo.pointTotals = this.getTotalPointValues(tournament);
    playerInfo["TUH"] = this.getTossupsHeard(tournament);
    playerInfo["Pts"] = this.getTotalPoints(tournament);
    playerInfo["PPG"] = this.getPointsPerGame(tournament);
    return { id: this.shortID, stats: playerInfo };
};

/**
* Returns all statistics information about a player in a javascript object given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
* @return all statistics information about a player
*/
playerSchema.methods.getAllInformationFiltered = function (tournament, constraints, teamMap) {
    var playerInfo = {};
    playerInfo["Player"] = this.player_name;
    playerInfo["Team"] = teamMap[this.teamID].name;
    playerInfo["GP"] = this.getTotalGamesPlayedFiltered(tournament, constraints);
    playerInfo.pointTotals = this.getTotalPointValuesFiltered(tournament, constraints);
    playerInfo["TUH"] = this.getTossupsHeardFiltered(tournament, constraints);
    playerInfo["Pts"] = this.getTotalPointsFiltered(tournament, constraints);
    playerInfo["PPG"] = this.getPointsPerGameFiltered(tournament, constraints);
    return { id: this.shortID, stats: playerInfo };
};

/**
* Returns all information about a player's games as an array
* @param tournament tournament to check
* @return array of information about player's games
*/
playerSchema.methods.getAllGamesInformation = function (tournament, teamMap) {
    var _this8 = this;

    var playedGames = [];
    tournament.games.forEach(function (currentGame) {
        if (currentGame.team1.team_id == _this8.teamID || currentGame.team2.team_id == _this8.teamID) {
            var formattedGame = _this8.formatGameInformation(currentGame, tournament, teamMap);
            playedGames.push(formattedGame);
        }
    });
    playedGames.sort(function (first, second) {
        return first["Round"] - second["Round"];
    });
    return playedGames;
};

/**
* Format's one game's information for a player
* @param game game to check
* @param tournament tournament to check
* @return information about a single game
*/
playerSchema.methods.formatGameInformation = function (game, tournament, teamMap) {
    var gameinfo = {};
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
};

/**
* Gets all of a player's game information
* @param tournament tournament to check
* @return statistics information about a player
*/
playerSchema.methods.getTotalGameStats = function (tournament, teamMap) {
    return this.getAllInformation(tournament, teamMap).stats;
};

module.exports = mongoose.model("Player", playerSchema);