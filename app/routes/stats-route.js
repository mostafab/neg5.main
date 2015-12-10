var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");
var statsController = require("../../app/controllers/stats-controller");

module.exports = function(app) {

    app.get("/home/tournaments/:tid/stats/team", function(req, res, next) {
        statsController.getTeamsInfo(req.params.tid, function(err, tournament, teamInfo) {
            if (err) {
                res.send(err);
            } else {
                if (teamInfo.length == 0) {
                    res.render("quick-teams", {teamInfo : teamInfo, tournament : tournament, headers : [], pointTypes : []});
                } else {
                    var headers = Object.keys(teamInfo[0]);
                    var pointTypes = Object.keys(teamInfo[0].pointTotals);
                    res.render("quick-teams", {teamInfo : teamInfo, tournament : tournament, headers : headers, pointTypes : pointTypes});
                }
            }
        });
    });

    app.get("/home/tournaments/:tid/stats/player", function(req, res, next) {
        statsController.getPlayersInfo(req.params.tid, function(err, tournament, playersInfo) {
            if (err) {
                res.send(err);
            } else {
                if (playersInfo.length == 0) {
                    res.render("quick-players", {playersInfo : playersInfo, tournament : tournament, headers : [], pointTypes : []});
                } else {
                    var headers = Object.keys(playersInfo[0]);
                    var pointTypes = Object.keys(playersInfo[0].pointTotals);
                    res.render("quick-players", {playersInfo : playersInfo, tournament : tournament, headers : headers, pointTypes : pointTypes});
                }
            }
        });
    });

    app.get("/home/tournaments/:tid/stats/teamfull", function(req, res, next) {
        statsController.getFullTeamsGameInformation(req.params.tid, function(err, tournament, teamsGames, playersInfo) {
            if (err) {
                res.send(err);
            } else {
                // console.log(teamsGames);
                var teamNames = Object.keys(teamsGames);
                if (teamNames.length == 0) {
                    res.render("full-teams", {teamsGames : teamsGames, playersInfo : playersInfo, tournament : tournament, teamNames : [], teamHeaders : [], playerHeaders : []});
                } else {
                    if (teamsGames[teamNames[0]].length == 0) {
                        res.render("full-teams", {teamsGames : teamsGames, playersInfo : playersInfo, tournament : tournament, teamNames : [], teamHeaders : [], playerHeaders : []});
                    } else {
                        var teamHeaders = Object.keys(teamsGames[teamNames[0]][0]);
                        if (playersInfo[teamNames[0]].length == 0) {
                            res.render("full-teams", {teamsGames : teamsGames, playersInfo : playersInfo, tournament : tournament, teamNames : teamNames, teamHeaders : teamHeaders, playerHeaders : []});
                        } else {
                            var playerHeaders = [];
                            var i = 0;
                            var emptyPlayers = true;
                            while (emptyPlayers) {
                                if (playersInfo[teamNames[i]].length != 0) {
                                    playerHeaders = Object.keys(playersInfo[teamNames[i]][0]);
                                    emptyPlayers = false;
                                }
                                i++;
                                if (i == teamNames.length) {
                                    emptyPlayers = false;
                                }
                            }
                            //console.log(playerHeaders);
                            res.render("full-teams", {teamsGames : teamsGames, playersInfo : playersInfo, tournament : tournament, teamNames : teamNames, teamHeaders : teamHeaders, playerHeaders : playerHeaders});
                        }
                    }

                }
            }
        });
    });

    app.get("*", function(req, res, next) {
        res.status(404).send("Can't find this page");
    });
};
