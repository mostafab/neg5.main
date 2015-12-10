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
            teamInfo.sort(function(first, second) {
                if (second["Win %"] == first["Win %"]) {
                    if (second["PPG"] == first["PPG"]) {
                        return second["PPB"] - first["PPB"];
                    }
                    return second["PPG"] - first["PPG"];
                } else {
                    return second["Win %"] - first["Win %"];
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
                return second["PPG"] - first["PPG"];
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
                // teamsInfo.push(result.teams[i].getAllGamesInformation(result));
                // teamsInfo[result.teams[i].team_name] = result.teams[i].getAllGamesInformation(result);
                // playersInfo[result.teams[i].team_name] = result.teams[i].getPlayerStats(result);
                // teamTotals[result.teams[i].team_name] = result.teams[i].getTotalGameStats(result);

                teamsInfo[result.teams[i].shortID] = {team : result.teams[i].team_name, games : result.teams[i].getAllGamesInformation(result)};
                playersInfo[result.teams[i].shortID] = {team : result.teams[i].team_name, stats : result.teams[i].getPlayerStats(result)};
                teamTotals[result.teams[i].shortID] = {team : result.teams[i].team_name, stats : result.teams[i].getTotalGameStats(result)};
            }
            // console.log(teamTotals);
            callback(null, result, teamsInfo, playersInfo, teamTotals);
        }
    });
}

function getFullPlayersGameInformation(tournamentid, callback) {
    var playersInfo = {};
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err || tournament == null) {

        } else {
            for (var i = 0; i < tournament.players.length; i++) {
                playersInfo[tournament.players[i].shortID] = {name : tournament.players[i].player_name, team : tournament.players[i].team_name, games : tournament.players[i].getAllGamesInformation(tournament)};
            }
            callback(null, tournament, playersInfo);
        }
    });
}

exports.getTeamsInfo = getTeamsInfo;
exports.getPlayersInfo = getPlayersInfo;
exports.getFullTeamsGameInformation = getFullTeamsGameInformation;
exports.getFullPlayersGameInformation = getFullPlayersGameInformation;
