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

exports.getTeamsInfo = getTeamsInfo;
exports.getPlayersInfo = getPlayersInfo;
