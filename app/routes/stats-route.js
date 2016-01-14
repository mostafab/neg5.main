var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");
var statsController = require("../../app/controllers/stats-controller");

module.exports = function(app) {

    app.get("/t/:tid/stats", function(req, res, next) {
        var tournament = req.params.tid;
        res.redirect("/t/" + tournament + "/stats/team");
    });

    app.get("/t/:tid/stats/team", function(req, res, next) {
        statsController.getTeamsInfo(req.params.tid, function(err, tournament, teamInfo) {
            if (err) {
                res.status(500).send(err);
            } else if (tournament == null) {
                // console.log(teamInfo);
                res.send("Couldn't find that tournament");
            } else {
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, divisions : tournament.divisions};
                res.render("quick-teams", {tournament : tournamentData, teamInfo : teamInfo, custom : false});
            }
        });
    });

    app.get("/t/:tid/stats/team/dl", function(req, res, next) {
        // res.send("OK");
        statsController.getTeamsInfo(req.params.tid, function(err, tournament, teamInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var linkTournamentName = tournament.tournament_name.replace(" ", "_").toLowerCase();
                // console.log(linkTeamName);
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, divisions : tournament.divisions};
                res.render("quick-teams-simple", {tournament : tournamentData, teamInfo : teamInfo, linkName : linkTournamentName});
            }
        });
    });

    app.get("/t/:tid/stats/player", function(req, res, next) {
        statsController.getPlayersInfo(req.params.tid, function(err, tournament, playersInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // console.log(playersInfo);
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme};
                res.render("quick-players", {tournament : tournamentData, playersInfo : playersInfo, custom : false});
            }
        });
    });

    app.get("/t/:tid/stats/player/dl", function(req, res, next) {
        statsController.getPlayersInfo(req.params.tid, function(err, tournament, playersInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var linkTournamentName = tournament.tournament_name.replace(" ", "_").toLowerCase();
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme};
                res.render("quick-players-simple", {tournament : tournamentData, playersInfo : playersInfo, linkName : linkTournamentName});
            }
        });
    });

    app.get("/t/:tid/stats/teamfull", function(req, res, next) {
        statsController.getFullTeamsGameInformation(req.params.tid, function(err, tournament, teamsGames, playersInfo, teamTotals) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // console.log(teamTotals);
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme};
                res.render("full-teams", {tournament : tournamentData, teamsGames : teamsGames, playersInfo : playersInfo, teamTotals : teamTotals});
            }
        });
    });

    app.get("/t/:tid/stats/teamfull/dl", function(req, res, next) {
        statsController.getFullTeamsGameInformation(req.params.tid, function(err, tournament, teamsGames, playersInfo, teamTotals) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // console.log(teamTotals);
                var linkTournamentName = tournament.tournament_name.replace(" ", "_").toLowerCase();
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme};
                res.render("full-team-simple", {tournament : tournamentData, teamsGames : teamsGames, playersInfo : playersInfo, teamTotals : teamTotals,
                    linkName : linkTournamentName});
            }
        });
    });

    app.get("/t/:tid/stats/playerfull", function(req, res, next) {
        statsController.getFullPlayersGameInformation(req.params.tid, function(err, tournament, playersInfo, playerTotals) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // console.log(playerTotals);
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme};
                res.render("full-player", {playersInfo : playersInfo, tournament : tournamentData, playerTotals : playerTotals});
            }
        });
    });

    app.get("/t/:tid/stats/playerfull/dl", function(req, res, next) {
        statsController.getFullPlayersGameInformation(req.params.tid, function(err, tournament, playersInfo, playerTotals) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // console.log(playerTotals);
                var linkTournamentName = tournament.tournament_name.replace(" ", "_").toLowerCase();
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme};
                res.render("full-players-simple", {playersInfo : playersInfo, tournament : tournamentData, playerTotals : playerTotals,
                    linkName : linkTournamentName});
            }
        });
    });

    app.get("/t/:tid/stats/roundreport", function(req, res, next) {
        statsController.getRoundReport(req.params.tid, function(err, tournament, roundsInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.status(404).end();
            } else {
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID};
                res.render("round-report", {tournament : tournamentData, roundsInfo : roundsInfo});
            }
        });
    });

    app.get("/t/:tid/stats/roundreport/dl", function(req, res, next) {
        statsController.getRoundReport(req.params.tid, function(err, tournament, roundsInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.status(404).end();
            } else {
                var linkTournamentName = tournament.tournament_name.replace(" ", "_").toLowerCase();
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID};
                res.render("round-report-simple", {tournament : tournamentData, roundsInfo : roundsInfo, linkName : linkTournamentName});
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
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                // res.send({type : "team", teamInfo: teamInfo, tournament : tournament});
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, divisions : tournament.divisions};
                res.render("quick-teams", {tournament : tournamentData, teamInfo : teamInfo, custom : true});
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
                var tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme};
                res.render("quick-players", {tournament : tournamentData, playersInfo : playersInfo, custom : true});
            }
        });
    });

    app.get("/t/:tid/export/qbj", function(req, res) {
        statsController.convertToQuizbowlSchema(req.params.tid, function(err, json) {
            if (err) {
                res.status(500).end();
            } else if (!json) {
                res.status(404).end();
            } else {
                res.status(200).set("Content-Type", "application/vnd.quizbowl.qbj+json").send(json);
            }
        });
    });

    // app.get("/t/:tid/export/sqbs", function(req, res) {
    //     statsController.convertToSQBS(req.params.tid, function(err, sqbs) {
    //         if (err) {
    //             res.status(500).end();
    //         } else if (!sqbs) {
    //             res.status(404).end();
    //         } else {
    //             res.status(200).send(sqbs);
    //         }
    //     });
    // });

    app.get("/t/:tid/export/scoresheets", function(req, res) {
        statsController.exportScoresheets(req.params.tid, function(err, scoresheets) {
            if (err) {
                res.status(500).end();
            } else if (!scoresheets) {
                res.status(404).end();
            } else {
                res.status(200).send({scoresheets : scoresheets.rounds, pointScheme : scoresheets.pointScheme});
            }
        });
    });

    app.get("*", function(req, res, next) {
        res.status(404).render("not-found", {tournamentd : req.session.director, msg : "That page doesn't exist."});
    });
};
