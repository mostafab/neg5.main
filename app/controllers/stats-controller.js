var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");


function getTeamsInfo(tournamentid, callback) {
    var teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, []);
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
            callback(null, result, teamInfo);
        }
    });
}

function getFilteredTeamsInformation(tournamentid, constraints, callback) {
    // console.log(constraints);
    var teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, result, {});
        } else {
            if (constraints.teams) {
                for (var i = 0; i < result.teams.length; i++) {
                    if (constraints.teams.indexOf(result.teams[i].shortID) != -1) {
                        // console.log(result.teams[i].team_name);
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

function getPlayersInfo(tournamentid, callback) {
    var playersInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, []);
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

function getFullTeamsGameInformation(tournamentid, callback) {
    var teamsInfo = {};
    var playersInfo = {};
    var teamTotals = {};
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err || result == null) {
            callback(err, null, {}, {});
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

function getFullPlayersGameInformation(tournamentid, callback) {
    var playersInfo = {};
    var playerTotals = {};
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err || tournament == null) {

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
