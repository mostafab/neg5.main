var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");
var statsController = require("../../app/controllers/stats-controller");

module.exports = function(app) {

    app.get("/t/:tid/stats/team", function(req, res, next) {
        statsController.getTeamsInfo(req.params.tid, function(err, tournament, teamInfo) {
            if (err) {
                res.send(err);
            } else if (tournament == null) {
                // console.log(teamInfo);
                res.send("Couldn't find that tournament");
            } else {
                res.render("quick-teams", {tournament : tournament, teamInfo : teamInfo, custom : false});
            }
        });
    });

    app.get("/t/:tid/stats/player", function(req, res, next) {
        statsController.getPlayersInfo(req.params.tid, function(err, tournament, playersInfo) {
            if (err) {
                res.send(err);
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // console.log(playersInfo);
                res.render("quick-players", {tournament : tournament, playersInfo : playersInfo, custom : false});
            }
        });
    });

    app.get("/t/:tid/stats/teamfull", function(req, res, next) {
        statsController.getFullTeamsGameInformation(req.params.tid, function(err, tournament, teamsGames, playersInfo, teamTotals) {
            if (err) {
                res.send(err);
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // console.log(teamTotals);
                res.render("full-teams", {tournament : tournament, teamsGames : teamsGames, playersInfo : playersInfo, teamTotals : teamTotals});
            }
        });
    });

    app.get("/t/:tid/stats/playerfull", function(req, res, next) {
        statsController.getFullPlayersGameInformation(req.params.tid, function(err, tournament, playersInfo, playerTotals) {
            if (err) {
                res.send(err);
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // console.log(playerTotals);
                res.render("full-player", {playersInfo : playersInfo, tournament : tournament, playerTotals : playerTotals});
            }
        });
    });

    app.post('/t/:tid/stats/filter/teams', function(req, res) {
        var constraints = {};
        constraints.teams = req.body.teams;
        if (req.body.minround.length == 0) {
            constraints.minround = Number.NEGATIVE_INFINITY;
        } else {
            constraints.minround = req.body.minround;
        }
        if (req.body.maxround.length == 0) {
            constraints.maxround = Number.POSITIVE_INFINITY;
        } else {
            constraints.maxround = req.body.maxround;
        }
        statsController.getFilteredTeamsInformation(req.params.tid, constraints, function(err, tournament, teamInfo) {
            if (err) {
                res.send(err);
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // res.send({type : "team", teamInfo: teamInfo, tournament : tournament});
                res.render("quick-teams", {tournament : tournament, teamInfo : teamInfo, custom : true});
            }
        });
    });

    app.post("/t/:tid/stats/filter/players", function(req, res) {
        var constraints = {};
        constraints.teams = req.body.teams;
        if (req.body.minround.length == 0) {
            constraints.minround = Number.NEGATIVE_INFINITY;
        } else {
            constraints.minround = req.body.minround;
        }
        if (req.body.maxround.length == 0) {
            constraints.maxround = Number.POSITIVE_INFINITY;
        } else {
            constraints.maxround = req.body.maxround;
        }
        statsController.getFilteredPlayersInformation(req.params.tid, constraints, function(err, tournament, playersInfo) {
            if (err) {
                res.send(err);
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                res.render("quick-players", {tournament : tournament, playersInfo : playersInfo, custom : true});
                // res.send({type : "player", playerInfo : playerInfo, tournament : tournament});
            }
        });
    });

    app.get("*", function(req, res, next) {
        res.status(404).render("not-found", {tournamentd : req.session.director, msg : "That page doesn't exist."});
    });
};
