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

exports.getTeamsInfo = getTeamsInfo;
exports.getPlayersInfo = getPlayersInfo;
exports.getFullTeamsGameInformation = getFullTeamsGameInformation;
exports.getFullPlayersGameInformation = getFullPlayersGameInformation;
exports.getFilteredTeamsInformation = getFilteredTeamsInformation;
exports.getFilteredPlayersInformation = getFilteredPlayersInformation;
