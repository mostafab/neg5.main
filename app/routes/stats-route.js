var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");
var statsController = require("../../app/controllers/stats-controller");

module.exports = function(app) {

    app.get("/home/tournaments/:tid/stats/team", function(req, res, next) {
        statsController.getTeamsInfo(req.params.tid, function(err, tournament, teamInfo) {
            if (err) {
                res.send(err);
            } else {
                // console.log(teamInfo);
                res.render("quick-teams", {tournament : tournament, teamInfo : teamInfo});
            }
        });
    });

    app.get("/home/tournaments/:tid/stats/player", function(req, res, next) {
        statsController.getPlayersInfo(req.params.tid, function(err, tournament, playersInfo) {
            if (err) {
                res.send(err);
            } else {
                // console.log(playersInfo);
                res.render("quick-players", {tournament : tournament, playersInfo : playersInfo});
            }
        });
    });

    app.get("/home/tournaments/:tid/stats/teamfull", function(req, res, next) {
        statsController.getFullTeamsGameInformation(req.params.tid, function(err, tournament, teamsGames, playersInfo, teamTotals) {
            if (err) {
                res.send(err);
            } else {
                // console.log(teamTotals);
                res.render("full-teams", {tournament : tournament, teamsGames : teamsGames, playersInfo : playersInfo, teamTotals : teamTotals});
            }
        });
    });

    app.get("/home/tournaments/:tid/stats/playerfull", function(req, res, next) {
        statsController.getFullPlayersGameInformation(req.params.tid, function(err, tournament, playersInfo, playerTotals) {
            if (err) {
                res.send(err);
            } else {
                // console.log(playerTotals);
                res.render("full-player", {playersInfo : playersInfo, tournament : tournament, playerTotals : playerTotals});
            }
        });
    });

    app.post('/home/tournaments/:tid/stats/full/filter', function(req, res) {
        res.send(req.body);
    });

    app.get("*", function(req, res, next) {
        res.status(404).send("Can't find this page");
    });
};
