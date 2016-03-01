'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const playerSchema = require("./player").schema;

/**
* Schema for a team
*/
const teamSchema = new Schema({
    team_name : {type : String, required : true},
    divisions : {},
    shortID : {type : String, required : true},
    registration_number : String
});

/**
* Gets a team's record
* @param tournament tournament to check
* @return team record
*/
teamSchema.methods.getRecord = function(tournament) {
    const record = {wins : 0, losses : 0, ties : 0};
    tournament.games.forEach(current => {
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
    });
    return record;
}

/**
* Get's a team's record given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
*/
teamSchema.methods.getRecordFiltered = function(tournament, constraints) {
    const record = {"wins" : 0, "losses" : 0, "ties" : 0};
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(current => {
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
    });
    return record;
}

/**
* Gets win percentage given a team's record
* @param record team's record
* @param team's win %
*/
teamSchema.methods.getWinPercentage = function(record) {
    if (record.wins + record.losses == 0) {
        return 0;
    } else {
        return +(record.wins / (record.wins + record.losses)).toFixed(3);
    }
}

/**
* Gets a team's ppg
* @param tournament tournament to check
* @return team ppg
*/
teamSchema.methods.getPointsPerGame = function(tournament) {
    let totalPoints = 0;
    let totalGames = 0;
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team1.score;
            totalGames++;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team2.score;
            totalGames++;
        }
    });
    if (totalGames == 0) {
        return 0;
    } else {
        return (totalPoints / totalGames).toFixed(2);
    }
}

/**
* Gets a team's ppg given constraints
* @param tournament tournament to check
* @param constraints limits on rounds
*/
teamSchema.methods.getPointsPerGameFiltered = function(tournament, constraints) {
    let totalPoints = 0;
    let totalGames = 0;
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team1.score;
            totalGames++;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team2.score;
            totalGames++;
        }
    });
    if (totalGames == 0) {
        return 0;
    } else {
        return (totalPoints / totalGames).toFixed(2);
    }
}

/**
* Get a team's opponent ppg
* @param tournament tournament to check
* @return opponent ppg
*/
teamSchema.methods.getOpponentPPG = function(tournament) {
    let totalPoints = 0;
    let totalGames = 0;
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team2.score;
            totalGames++;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team1.score;
            totalGames++;
        }
    });
    if (totalGames == 0) {
        return 0;
    } else {
        return +(totalPoints / totalGames).toFixed(2);
    }
}

/**
* Get a team's opponent ppg given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
*/
teamSchema.methods.getOpponentPPGFiltered = function(tournament, constraints) {
    let totalPoints = 0;
    let totalGames = 0;
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team2.score;
            totalGames++;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team1.score;
            totalGames++;
        }
    });
    if (totalGames == 0) {
        return 0;
    } else {
        return +(totalPoints / totalGames).toFixed(2);
    }
}

/**
* Get a team's total tossups
* @param tournament tournament to check
* @return a team's total tossups in JSON
*/
teamSchema.methods.getTossupTotals = function(tournament) {
    const pointTotals = {};
    for (let pointValue in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
            pointTotals[pointValue] = 0;
        }
    }
    tournament.games.forEach(current => {
        if (current.team1.team_id == this._id && current.team1.playerStats) {
            for (let player in current.team1.playerStats) {
                if (current.team1.playerStats.hasOwnProperty(player)) {
                    const stats = current.team1.playerStats[player];
                    for (let pointValue in tournament.pointScheme) {
                        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
                            if (stats[pointValue] && pointTotals[pointValue] != undefined) {
                                pointTotals[pointValue] += parseFloat(stats[pointValue]);
                            }
                        }
                    }
                }
            }
        } else if (current.team2.team_id == this._id && current.team2.playerStats) {
            for (let player in current.team2.playerStats) {
                if (current.team2.playerStats.hasOwnProperty(player)) {
                    const stats = current.team2.playerStats[player];
                    for (let pointValue in tournament.pointScheme) {
                        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
                            if (stats[pointValue] && pointTotals[pointValue] != undefined) {
                                pointTotals[pointValue] += parseFloat(stats[pointValue]);
                            }
                        }
                    }
                }
            }
        }
    });
    return pointTotals;
}

/**
* Get a team's total tossups
* @param tournament tournament to check
* @param constraints limits on rounds
* @return a team's total tossups in JSON
*/
teamSchema.methods.getTossupTotalsFiltered = function(tournament, constraints) {
    const pointTotals = {};
    for (let pointValue in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
            pointTotals[pointValue] = 0;
        }
    }
    const filteredGames = tournament.games.filter(function(game) {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(current => {
        if (current.team1.team_id == this._id && current.team1.playerStats) {
            for (let player in current.team1.playerStats) {
                if (current.team1.playerStats.hasOwnProperty(player)) {
                    const stats = current.team1.playerStats[player];
                    for (let pointValue in tournament.pointScheme) {
                        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
                            if (stats[pointValue] && pointTotals[pointValue] != undefined) {
                                pointTotals[pointValue] += parseFloat(stats[pointValue]);
                            }
                        }
                    }
                }
            }
        } else if (current.team2.team_id == this._id && current.team2.playerStats) {
            for (let player in current.team2.playerStats) {
                if (current.team2.playerStats.hasOwnProperty(player)) {
                    const stats = current.team2.playerStats[player];
                    for (let pointValue in tournament.pointScheme) {
                        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
                            if (stats[pointValue] && pointTotals[pointValue] != undefined) {
                                pointTotals[pointValue] += parseFloat(stats[pointValue]);
                            }
                        }
                    }
                }
            }
        }
    });
    return pointTotals;
}

/**
* Get a team's tossups in one game by summing the player totals
* @param game game to check
* @param tournament to check
* @return tossup totals for one game
*/
teamSchema.methods.getTossupTotalsOneGame = function(game, tournament) {
    const pointTotals = {};
    for (let pointValue in tournament.pointScheme) {
        if (tournament.pointScheme.hasOwnProperty(pointValue)) {
            pointTotals[pointValue] = 0;
        }
    }
    if (game.team1.team_id == this._id && game.team1.playerStats) {
        for (let player in game.team1.playerStats) {
            if (game.team1.playerStats.hasOwnProperty(player)) {
                const stats = game.team1.playerStats[player];
                for (let pointValue in tournament.pointScheme) {
                    if (tournament.pointScheme.hasOwnProperty(pointValue)) {
                        if (stats[pointValue] && pointTotals[pointValue] != undefined) {
                            pointTotals[pointValue] += parseFloat(stats[pointValue]);
                        }
                    }
                }
            }
        }
    } else if (game.team2.team_id == this._id && game.team2.playerStats) {
        for (let player in game.team2.playerStats) {
            if (game.team2.playerStats.hasOwnProperty(player)) {
                const stats = game.team2.playerStats[player];
                for (let pointValue in tournament.pointScheme) {
                    if (tournament.pointScheme.hasOwnProperty(pointValue)) {
                        if (stats[pointValue] && pointTotals[pointValue] != undefined) {
                            pointTotals[pointValue] += parseFloat(stats[pointValue]);
                        }
                    }
                }
            }
        }
    }
    return pointTotals;

}

/**
* Get a team's total bous points
* @param tournament tournament to check
* @return total bonus points
*/
teamSchema.methods.getTotalBonusPoints = function(tournament) {
    const pointTotals = this.getTossupTotals(tournament);
    let totalPoints = 0;
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team1.score - currentGame.team1.bouncebacks;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team2.score - currentGame.team2.bouncebacks;
        }
    });
    for (let point in pointTotals) {
        if (pointTotals.hasOwnProperty(point)) {
            totalPoints -= parseFloat(point) * parseFloat(pointTotals[point]);
        }
    }
    return totalPoints;
}

/**
* Get a team's total bous points given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
* @return total bonus points
*/
teamSchema.methods.getTotalBonusPointsFiltered = function(tournament, constraints) {
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    const pointTotals = this.getTossupTotalsFiltered(tournament, constraints);
    let totalPoints = 0;
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id) {
            totalPoints += currentGame.team1.score - currentGame.team1.bouncebacks;
        } else if (currentGame.team2.team_id == this._id) {
            totalPoints += currentGame.team2.score - currentGame.team2.bouncebacks;
        }
    });
    for (let point in pointTotals) {
        if (pointTotals.hasOwnProperty(point)) {
            totalPoints -= parseFloat(point) * parseFloat(pointTotals[point]);
        }
    }
    return totalPoints;
}

/**
* Gets a team's bonus points for one game
* @param game game to check
* @param tournament tournament to check
* @return bonus points for team
*/
teamSchema.methods.getBonusPointsOneGame = function(game, tournament) {
    const pointTotals = this.getTossupTotalsOneGame(game, tournament);
    let bonusPoints = 0;
    if (game.team1.team_id == this._id) {
        bonusPoints += game.team1.score - game.team1.bouncebacks;
    } else {
        bonusPoints += game.team2.score - game.team2.bouncebacks;
    }
    for (let point in pointTotals) {
        if (pointTotals.hasOwnProperty(point)) {
            bonusPoints -= parseFloat(point) * parseFloat(pointTotals[point]);
        }
    }
    return bonusPoints;

}

/**
* Get total tossups a team has gotten
* @param tournament tournament to check
* @return team's total gets
*/
teamSchema.methods.getTotalGets = function(tournament) {
    const pointTotals = this.getTossupTotals(tournament);
    let totalGets = 0;
    for (let values in pointTotals) {
        if (pointTotals.hasOwnProperty(values) && tournament.pointsTypes[values] != "N") {
            totalGets += pointTotals[values];
        }
    }
    return totalGets;
}

/**
* Get total tossups a team has gotten given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
* @return team's total gets
*/
teamSchema.methods.getTotalGetsFiltered = function(tournament, constraints) {
    const pointTotals = this.getTossupTotalsFiltered(tournament, constraints);
    let totalGets = 0;
    for (let values in pointTotals) {
        if (pointTotals.hasOwnProperty(values) && tournament.pointsTypes[values] != "N") {
            totalGets += pointTotals[values];
        }
    }
    return totalGets;
}

/**
* Get total gets for one game
* @param game game to check
* @param tournament tournament to check
* @return total gets for one game
*/
teamSchema.methods.getTotalGetsOneGame = function(game, tournament) {
    const pointTotals = this.getTossupTotalsOneGame(game, tournament);
    let totalGets = 0;
    for (let values in pointTotals) {
        if (pointTotals.hasOwnProperty(values) && tournament.pointsTypes[values] != "N") {
            totalGets += pointTotals[values];
        }
    }
    return totalGets;
}

/**
* Get a team's total negs
* @param tournament tournament to check
* @return a team's total negs
*/
teamSchema.methods.getTotalNegs = function(tournament) {
    const pointTotals = this.getTossupTotals(tournament);
    let totalNegs = 0;
    for (let values in pointTotals) {
        if (pointTotals.hasOwnProperty(values) && tournament.pointsTypes[values] == "N") {
            totalNegs += pointTotals[values];
        }
    }
    return totalNegs;
}

/**
* Get total tossups a team has heard
* @param tournament tournament to check
* @return tossups heard
*/
teamSchema.methods.getTossupsHeard = function(tournament) {
    let totalTossups = 0;
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id || currentGame.team2.team_id == this._id) {
            totalTossups += currentGame.tossupsheard;
        }
    });
    return totalTossups;
}

/**
* Get total tossups a team has heard given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
* @return tossups heard
*/
teamSchema.methods.getTossupsHeardFiltered = function(tournament, constraints) {
    let totalTossups = 0;
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id || currentGame.team2.team_id == this._id) {
            totalTossups += currentGame.tossupsheard;
        }
    });
    return totalTossups;
}

/**
* Get a team's points per bonus
* @param tournament tournament to check
* @return team's overall points-per-bonus
*/
teamSchema.methods.getOverallPPB = function(tournament) {
    const totalBonusPoints = this.getTotalBonusPoints(tournament);
    const totalGets = this.getTotalGets(tournament);
    if (totalGets == 0) {
        return 0;
    }
    return +(totalBonusPoints / totalGets).toFixed(2);
}

/**
* Get a team's points per bonus given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
* @return team's overall points-per-bonus
*/
teamSchema.methods.getOverallPPBFiltered = function(tournament, constraints) {
    const totalBonusPoints = this.getTotalBonusPointsFiltered(tournament, constraints);
    const totalGets = this.getTotalGetsFiltered(tournament, constraints);
    if (totalGets == 0) {
        return 0;
    }
    return +(totalBonusPoints / totalGets).toFixed(2);
}

/**
* Get a team's ppb for one game
* @param game game to check
* @param tournament tournament to check
* @return points-per-bonus for one game
*/
teamSchema.methods.getPPBOneGame = function(game, tournament) {
    const bonusPoints = this.getBonusPointsOneGame(game, tournament);
    const totalGets = this.getTotalGetsOneGame(game, tournament);
    if (totalGets == 0) {
        return 0;
    }
    return +(bonusPoints / totalGets).toFixed(2);
}

/**
* Get team's margin of victory
* @param tournament tournament to check
* @return avg margin of victory
*/
teamSchema.methods.getAverageMarginOfVictory = function(tournament) {
    return +(this.getPointsPerGame(tournament) - this.getOpponentPPG(tournament)).toFixed(3);
}

/**
* Get team's margin of victory given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
* @return avg margin of victory
*/
teamSchema.methods.getAverageMarginOfVictoryFiltered = function(tournament, constraints) {
    return +(this.getPointsPerGameFiltered(tournament, constraints) - this.getOpponentPPGFiltered(tournament, constraints)).toFixed(3);
}

/**
* Get all of a team's bounceback points
* @param tournament tournament to check
* @return total bounceback points
*/
teamSchema.methods.getTotalBouncebackPoints = function(tournament) {
    let totalBouncebackPoints = 0;
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id) {
            totalBouncebackPoints += currentGame.team1.bouncebacks;
        } else if (currentGame.team2.team_id == this._id) {
            totalBouncebackPoints += currentGame.team2.bouncebacks;
        }
    });
    return totalBouncebackPoints;
}

/**
* Get all of a team's overall statistical information given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
* @return average information about a team's stats
*/
teamSchema.methods.getAverageInformationFiltered = function(tournament, constraints) {
    const record = this.getRecordFiltered(tournament, constraints);
    const teamInfo = {};
    let activePhase = "";
    for (let i = 0; i < tournament.phases.length; i++) {
        if (tournament.phases[i].active) {
            activePhase = tournament.phases[i].phase_id;
            break;
        }
    }
    teamInfo["Division"] = this.divisions ? this.divisions[activePhase] : "";
    teamInfo["Team"] = this.team_name;
    teamInfo["W"] = record.wins;
    teamInfo["L"] = record.losses;
    teamInfo["T"] = record.ties;
    teamInfo["Win %"] = this.getWinPercentage(record);
    teamInfo["PPG"] = this.getPointsPerGameFiltered(tournament, constraints);
    teamInfo["PAPG"] = this.getOpponentPPGFiltered(tournament, constraints);
    teamInfo["Margin"] = this.getAverageMarginOfVictoryFiltered(tournament, constraints);
    teamInfo.pointTotals = this.getTossupTotalsFiltered(tournament, constraints);
    teamInfo["TUH"] = this.getTossupsHeardFiltered(tournament, constraints);
    teamInfo["Bonus Points"] = this.getTotalBonusPointsFiltered(tournament, constraints);
    teamInfo["PPB"] = this.getOverallPPBFiltered(tournament, constraints);
    return {id : this.shortID, stats : teamInfo};
}

/**
* Get all of a team's overall statistical information
* @param tournament tournament to check
* @return average information about a team's stats
*/
teamSchema.methods.getAverageInformation = function(tournament) {
    const record = this.getRecord(tournament);
    const teamInfo = {};
    teamInfo["Team"] = this.team_name;
    if (tournament.divisions.length !== 0 && tournament.currentPhaseID != 1
        && this.divisions && this.divisions[tournament.currentPhaseID]) {
        teamInfo["Division"] = !this.divisions ? "" : this.divisions[tournament.currentPhaseID];
    } else if (tournament.divisions.length !== 0) {
        teamInfo["Division"] = "";
    }
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
    return {id : this.shortID, stats : teamInfo};
}

/**
* Get all of a team's overall statistical info about all games played
* @param tournament tournament to check
* @return all information about a team's games
*/
teamSchema.methods.getAllGamesInformation = function(tournament, teamMap) {
    let playedGames = [];
    tournament.games.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id || currentGame.team2.team_id == this._id) {
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
* Get all of a team's overall statistical info about all games played given constraints
* @param tournament tournament to check
* @param constraints bounds on rounds
* @return all information about a team's games
*/
teamSchema.methods.getAllGamesInformationFiltered = function(tournament, constraints, teamMap) {
    let playedGames = [];
    const filteredGames = tournament.games.filter(game => {
        return game.round >= constraints.minround && game.round <= constraints.maxround;
    });
    filteredGames.forEach(currentGame => {
        if (currentGame.team1.team_id == this._id || currentGame.team2.team_id == this._id) {
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
* Formats a team's game information to get ready for presentation
* @param game game to check
* @param tournament tournament to check
* @return formatted info about a game
*/
teamSchema.methods.formatGameInformation = function(game, tournament, teamMap) {
    const gameinfo = {};
    gameinfo["Round"] = game.round;
    if (game.team1.team_id == this._id) {
        gameinfo["Opponent"] = teamMap[game.team2.team_id].name;
        if (game.team1.score > game.team2.score) {
            gameinfo["Result"] = "W";
        } else if (game.team2.score > game.team1.score) {
            gameinfo["Result"] = "L";
        } else {
            gameinfo["Result"] = "T";
        }
        gameinfo["Score"] = game.team1.score;
        gameinfo["Opponent Score"] = game.team2.score;
        gameinfo.pointValues = this.getTossupTotalsOneGame(game, tournament);
        gameinfo["TUH"] = game.tossupsheard;
        gameinfo["Bonus Points"] = this.getBonusPointsOneGame(game, tournament);
        gameinfo["PPB"] = this.getPPBOneGame(game, tournament);
    } else {
        gameinfo["Opponent"] = teamMap[game.team1.team_id].name;
        if (game.team1.score > game.team2.score) {
            gameinfo["Result"] = "L";
        } else if (game.team2.score > game.team1.score) {
            gameinfo["Result"] = "W";
        } else {
            gameinfo["Result"] = "T";
        }
        gameinfo["Score"] = game.team2.score;
        gameinfo["Opponent Score"] = game.team1.score;
        gameinfo.pointValues = this.getTossupTotalsOneGame(game, tournament);
        gameinfo["TUH"] = game.tossupsheard;
        gameinfo["Bonus Points"] = this.getBonusPointsOneGame(game, tournament);
        gameinfo["PPB"] = this.getPPBOneGame(game, tournament);
    }
    return gameinfo;
}

/**
* Gets stats about players on this team
* @param tournament tournament to get players from
* @return array of player statistics
*/
teamSchema.methods.getPlayerStats = function(tournament, teamMap) {
    let playerStats = [];
    const team = this;
    const filtered = tournament.players.filter(function(player) {
        return player.teamID == team._id;
    });
    filtered.forEach(player => {
        playerStats.push(player.getAllInformation(tournament, teamMap));
    });
    return playerStats;
}

/**
* Gets total statistics about a game
* @param tournament tournament to check
* @return statistics about all a team's games
*/
teamSchema.methods.getTotalGameStats = function(tournament) {
    const totals = this.getAverageInformation(tournament);
    const record = this.getRecord(tournament);
    let gp = 0;
    for (let total in record) {
        if (record.hasOwnProperty(total)) {
            gp += record[total];
        }
    }
    totals.stats["Score"] = totals.stats["PPG"] * gp;
    totals.stats["Opponent Score"] = totals.stats["PAPG"] * gp;
    totals.stats.pointValues = totals.stats.pointTotals;
    return totals.stats;
}

module.exports = mongoose.model("Team", teamSchema);
