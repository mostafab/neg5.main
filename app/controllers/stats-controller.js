var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");

/**
* Responsible for gathering basic statistics information about a tournament's teams
* and calling the given callback with an err if needed, the tournament found, and
* the array of team statistics
* @param tournamentid id of the tournament to get team statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of team statistics
*/
function getTeamsInfo(tournamentid, callback) {
    var teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {

        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            for (var i = 0; i < result.teams.length; i++) {
                teamInfo.push(result.teams[i].getAverageInformation(result));
            }
            // console.log(teamInfo);
            teamInfo.sort(function(first, second) {
                if (second.stats["Win %"] == first.stats["Win %"]) {
                    if (second.stats["PPG"] == first.stats["PPG"]) {
                        return second.stats["PPB"] - first.stats["PPB"];
                    }
                    return second.stats["PPG"] - first.stats["PPG"];
                } else {
                    return second.stats["Win %"] - first.stats["Win %"];
                }
            });
            for (var i = 0; i < teamInfo.length; i++) {
                teamInfo[i].stats["Rank"] = i + 1;
            }
            // console.log(teamInfo);
            callback(null, result, teamInfo);
        }
    });
}

/**
* Responsible for gathering statistics information given constraints about a tournament's teams
* and calling the given callback with an err if needed, the tournament found, and
* the array of team statistics
* @param tournamentid id of the tournament to get team statistics from
* @param constraints limits on the teams to get, min and max round
* @param callback asynchronous callback function called after this function is done with the
* list of team statistics
*/
function getFilteredTeamsInformation(tournamentid, constraints, callback) {
    // console.log(constraints);
    var teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, [])
        } else {
            if (constraints.teams) {
                for (var i = 0; i < result.teams.length; i++) {
                    if (constraints.teams.indexOf(result.teams[i]._id.toString()) != -1) {
                        teamInfo.push(result.teams[i].getAverageInformationFiltered(result, constraints));
                    }
                }
            } else {
                for (var i = 0; i < result.teams.length; i++) {
                    teamInfo.push(result.teams[i].getAverageInformationFiltered(result, constraints));
                }
            }
            teamInfo.sort(function(first, second) {
                if (second.stats["Win %"] == first.stats["Win %"]) {
                    if (second.stats["PPG"] == first.stats["PPG"]) {
                        return second.stats["PPB"] - first.stats["PPB"];
                    }
                    return second.stats["PPG"] - first.stats["PPG"];
                } else {
                    return second.stats["Win %"] - first.stats["Win %"];
                }
            });
            callback(null, result, teamInfo);
        }
    });

}

/**
* Responsible for gathering basic statistics information about a tournament's players
* and calling the given callback with an err if needed, the tournament found, and
* the array of player statistics
* @param tournamentid id of the tournament to get player statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of player statistics
*/
function getPlayersInfo(tournamentid, callback) {
    var playersInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            for (var i = 0; i < result.players.length; i++) {
                playersInfo.push(result.players[i].getAllInformation(result));
            }
            playersInfo.sort(function(first, second) {
                return second.stats["PPG"] - first.stats["PPG"];
            });
            callback(null, result, playersInfo);
        }
    });
}

/**
* Responsible for gathering statistics information about a tournament's players given a set of constraints
* and calling the given callback with an err if needed, the tournament found, and
* the array of player statistics
* @param tournamentid id of the tournament to get player statistics from
* @param constraints  constraints on teams, and min and max round
* @param callback asynchronous callback function called after this function is done with the
* list of player statistics
*/
function getFilteredPlayersInformation(tournamentid, constraints, callback) {
    var playersInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            if (constraints.teams) {
                for (var i = 0; i < result.players.length; i++) {
                    if (constraints.teams.indexOf(result.players[i].teamID) != -1) {
                        playersInfo.push(result.players[i].getAllInformationFiltered(result, constraints));
                    }
                }
            } else {
                for (var i = 0; i < result.players.length; i++) {
                    playersInfo.push(result.players[i].getAllInformationFiltered(result, constraints));
                }
            }
            playersInfo.sort(function(first, second) {
                return second.stats["PPG"] - first.stats["PPG"];
            });
            callback(null, result, playersInfo);
        }
    });
}

/**
* Responsible for gathering full statistics information about a tournament's teams
* and calling the given callback with an err if needed, the tournament found, and
* the array of team statistics
* @param tournamentid id of the tournament to get team statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of team statistics
*/
function getFullTeamsGameInformation(tournamentid, callback) {
    var teamsInfo = {};
    var playersInfo = {};
    var teamTotals = {};
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, {}, {});
        } else if (result == null) {
            callback(null, null, {}, {});
        } else {
            for (var i = 0; i < result.teams.length; i++) {
                teamsInfo[result.teams[i].shortID] = {team : result.teams[i].team_name, games : result.teams[i].getAllGamesInformation(result)};
                playersInfo[result.teams[i].shortID] = {team : result.teams[i].team_name, stats : result.teams[i].getPlayerStats(result)};
                teamTotals[result.teams[i].shortID] = {team : result.teams[i].team_name, stats : result.teams[i].getTotalGameStats(result)};
            }
            callback(null, result, teamsInfo, playersInfo, teamTotals);
        }
    });
}

/**
* Responsible for gathering full statistics information about a tournament's players
* and calling the given callback with an err if needed, the tournament found, and
* the array of player statistics
* @param tournamentid id of the tournament to get player statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of player statistics
*/
function getFullPlayersGameInformation(tournamentid, callback) {
    var playersInfo = {};
    var playerTotals = {};
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null, {}, {});
        } else if (tournament == null) {
            callback(null, null, {}, {});
        } else {
            for (var i = 0; i < tournament.players.length; i++) {
                playersInfo[tournament.players[i].shortID] = {name : tournament.players[i].player_name, team : tournament.players[i].team_name, games : tournament.players[i].getAllGamesInformation(tournament)};
                playerTotals[tournament.players[i].shortID] = tournament.players[i].getTotalGameStats(tournament);
            }
            callback(null, tournament, playersInfo, playerTotals);
        }
    });
}

/**
* Gets round report information
* @param tournamentid id of the tournament to get round averages from
* @param callback callback function with an error (or null), tournament name, and the rounds information
*/
function getRoundReport(tournamentid, callback) {
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null, null);
        } else if (!tournament) {
            callback(null, null, null);
        } else {
            var gameRounds = {};
            for (var i = 0; i < tournament.games.length; i++) {
                var round = tournament.games[i].round;
                if (!gameRounds[round]) {
                    gameRounds[round] = [];
                }
                gameRounds[round].push(tournament.games[i]);
            }
            var roundAverages = {};
            var rounds = Object.keys(gameRounds);
            for (var i = 0; i < rounds.length; i++) {
                roundAverages[rounds[i]] = {};
                roundAverages[rounds[i]]["PPG/Team"] = getRoundPPG(gameRounds[rounds[i]]);
                roundAverages[rounds[i]]["TUPts/TUH"] = getRoundTUPts(gameRounds[rounds[i]], tournament.pointScheme);
                roundAverages[rounds[i]]["PPB"] = getPPBForRounds(gameRounds[rounds[i]], tournament.pointScheme, tournament.pointsTypes);
            }
            callback(null, tournament, roundAverages);
        }
    });
}

/**
* Returns the PPG for a round
* @param games array of games to parse
* @return round ppg
*/
function getRoundPPG(games) {
    var totalPoints = 0;
    var totalTeams = 0;
    for (var i = 0; i < games.length; i++) {
        var currentGame = games[i];
        if (currentGame.team1) {
            totalPoints += currentGame.team1.score;
            totalTeams++;
        }
        if (currentGame.team2) {
            totalPoints += currentGame.team2.score;
            totalTeams++;
        }
    }
    return +(totalPoints / totalTeams).toFixed(2);
}

/**
* Gets average TUPts/TUH
* @param games array of games to parse
* @param pointScheme point values used in tournament
* @return average TUPts/TUH
*/
function getRoundTUPts(games, pointScheme) {
    var pointTypes = Object.keys(pointScheme);
    // console.log(pointTypes);
    var totalTossupsHeard = 0;
    var tossupPoints = 0;
    for (var i = 0; i < games.length; i++) {
        totalTossupsHeard +=  games[i].tossupsheard;
        if (games[i].team1 && games[i].team1.playerStats) {
            for (var player in games[i].team1.playerStats) {
                if (games[i].team1.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team1.playerStats[player];
                    // console.log(player);
                    for (var j = 0; j < pointTypes.length; j++) {
                        if (stats[pointTypes[j]]) {
                            // console.log(parseFloat(pointTypes[j]));
                            // console.log(parseFloat(stats[pointTypes[j]]));
                            // console.log(stats[pointTypes[j]]);
                            var total = parseFloat(pointTypes[j]) * parseFloat(stats[pointTypes[j]]);
                            // console.log(total);
                            tossupPoints += total;
                        }
                    }
                }
            }
        }
        if (games[i].team2 && games[i].team2.playerStats) {
            for (var player in games[i].team2.playerStats) {
                if (games[i].team2.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team2.playerStats[player];
                    // console.log(player);
                    for (var j = 0; j < pointTypes.length; j++) {
                        if (stats[pointTypes[j]]) {
                            var total = parseFloat(pointTypes[j]) * parseFloat(stats[pointTypes[j]]);
                            tossupPoints += total;
                        }
                    }
                }
            }
        }
    }
    // console.log(tossupPoints);
    return +(tossupPoints / totalTossupsHeard).toFixed(2);
}

/**
* Returns average bonus points for a round's games
* @param games games for one round
* @param pointScheme point value used in tournament
* @param pointTypes type of each point value
* @return average ppb for a round's games
*/
function getPPBForRounds(games, pointScheme, pointTypes) {
    var totalBonusPoints = 0;
    var totalTossupsGotten = 0;
    var pointKeys = Object.keys(pointScheme);

    for (var i = 0; i < games.length; i++) {
        if (games[i].team1 && games[i].team1.playerStats) {
            var bonusPoints = games[i].team1.score - games[i].team1.bouncebacks;
            for (var player in games[i].team1.playerStats) {
                if (games[i].team1.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team1.playerStats[player];
                    // console.log(player);
                    for (var j = 0; j < pointKeys.length; j++) {
                        // console.log(stats[pointKeys[j]]);
                        if (pointTypes[pointKeys[j]] != "N" && stats[pointKeys[j]]) {
                            totalTossupsGotten += parseFloat(stats[pointKeys[j]]);
                        }
                        if (stats[pointKeys[j]]) {
                            bonusPoints -= parseFloat(stats[pointKeys[j]]) * parseFloat(pointKeys[j]);
                        }
                    }
                }
            }
            totalBonusPoints += bonusPoints;
        }
        if (games[i].team2 && games[i].team2.playerStats) {
            var bonusPoints = games[i].team2.score - games[i].team2.bouncebacks;
            for (var player in games[i].team2.playerStats) {
                if (games[i].team2.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team2.playerStats[player];
                    // console.log(player);
                    for (var j = 0; j < pointKeys.length; j++) {
                        // console.log(stats[pointKeys[j]]);
                        if (pointTypes[pointKeys[j]] != "N" && stats[pointKeys[j]]) {
                            totalTossupsGotten += parseFloat(stats[pointKeys[j]]);
                        }
                        if (stats[pointKeys[j]]) {
                            bonusPoints -= parseFloat(stats[pointKeys[j]]) * parseFloat(pointKeys[j]);
                        }
                    }
                }
            }
            totalBonusPoints += bonusPoints;
        }
    }
    // console.log(totalTossupsGotten);
    return totalTossupsGotten == 0 ? 0 : +(totalBonusPoints / totalTossupsGotten).toFixed(2);
}

exports.getTeamsInfo = getTeamsInfo;
exports.getPlayersInfo = getPlayersInfo;
exports.getFullTeamsGameInformation = getFullTeamsGameInformation;
exports.getFullPlayersGameInformation = getFullPlayersGameInformation;
exports.getFilteredTeamsInformation = getFilteredTeamsInformation;
exports.getFilteredPlayersInformation = getFilteredPlayersInformation;
exports.getRoundReport = getRoundReport;
exports.getPPBForRounds = getPPBForRounds;
