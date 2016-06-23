'use strict';

var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");
var statsController = require("../controllers/stats-controller");

module.exports = function (app) {

    app.get("/search", function (req, res) {
        res.render("search/search", { tournamentd: req.session.director });
    });

    app.get("/search/submit", function (req, res) {
        statsController.findTournamentsByNameAndSet(req.query.t_name, req.query.t_qset, function (err, tournaments) {
            if (err) {
                console.log(err);
                res.status(500).end();
            } else {
                res.render("search/tournament-search-result", { tournaments: tournaments });
            }
        });
    });

    app.get("/t/:tid/stats", function (req, res, next) {
        var tournament = req.params.tid;
        res.redirect("/t/" + tournament + "/stats/team?phase=1");
    });

    app.get("/t/:tid/stats/team", function (req, res, next) {
        statsController.getTeamsInfo(req.params.tid, req.query.phase, function (err, tournament, teamInfo) {
            if (err) {
                res.status(500).send(err);
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, divisions: tournament.divisions, phaseInfo: tournament.phaseInfo };
                res.render("stats/quick-teams", { tournament: tournamentData, teamInfo: teamInfo, custom: false });
            }
        });
    });

    app.get("/t/:tid/stats/team/dl", function (req, res, next) {
        statsController.getTeamsInfo(req.params.tid, req.query.phase, function (err, tournament, teamInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(/\s/g, "_").toLowerCase();
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, divisions: tournament.divisions, phaseInfo: tournament.phaseInfo };
                res.render("stats/quick-teams-simple", { tournament: tournamentData, teamInfo: teamInfo, linkName: linkTournamentName });
            }
        });
    });

    app.get("/t/:tid/stats/player", function (req, res, next) {
        statsController.getPlayersInfo(req.params.tid, req.query.phase, function (err, tournament, playersInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, phaseInfo: tournament.phaseInfo };
                res.render("stats/quick-players", { tournament: tournamentData, playersInfo: playersInfo, custom: false });
            }
        });
    });

    app.get("/t/:tid/stats/player/dl", function (req, res, next) {
        statsController.getPlayersInfo(req.params.tid, req.query.phase, function (err, tournament, playersInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(" ", "_").toLowerCase();
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, phaseInfo: tournament.phaseInfo };
                res.render("stats/quick-players-simple", { tournament: tournamentData, playersInfo: playersInfo, linkName: linkTournamentName });
            }
        });
    });

    app.get("/t/:tid/stats/teamfull", function (req, res, next) {
        statsController.getFullTeamsGameInformation(req.params.tid, req.query.phase, function (err, tournament, teamsGames, playersInfo, teamTotals) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, phaseInfo: tournament.phaseInfo };
                res.render("stats/full-teams", { tournament: tournamentData, teamsGames: teamsGames, playersInfo: playersInfo, teamTotals: teamTotals });
            }
        });
    });

    app.get("/t/:tid/stats/teamfull/dl", function (req, res, next) {
        statsController.getFullTeamsGameInformation(req.params.tid, req.query.phase, function (err, tournament, teamsGames, playersInfo, teamTotals) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(" ", "_").toLowerCase();
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, phaseInfo: tournament.phaseInfo };
                res.render("stats/full-team-simple", { tournament: tournamentData, teamsGames: teamsGames, playersInfo: playersInfo, teamTotals: teamTotals,
                    linkName: linkTournamentName });
            }
        });
    });

    app.get("/t/:tid/stats/playerfull", function (req, res, next) {
        statsController.getFullPlayersGameInformation(req.params.tid, req.query.phase, function (err, tournament, playersInfo, playerTotals) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, phaseInfo: tournament.phaseInfo };
                res.render("stats/full-player", { playersInfo: playersInfo, tournament: tournamentData, playerTotals: playerTotals });
            }
        });
    });

    app.get("/t/:tid/stats/playerfull/dl", function (req, res, next) {
        statsController.getFullPlayersGameInformation(req.params.tid, req.query.phase, function (err, tournament, playersInfo, playerTotals) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                var linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(" ", "_").toLowerCase();
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, phaseInfo: tournament.phaseInfo };
                res.render("stats/full-players-simple", { playersInfo: playersInfo, tournament: tournamentData, playerTotals: playerTotals,
                    linkName: linkTournamentName });
            }
        });
    });

    app.get("/t/:tid/stats/roundreport", function (req, res, next) {
        statsController.getRoundReport(req.params.tid, req.query.phase, function (err, tournament, roundsInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.status(404).end();
            } else {
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID, phaseInfo: tournament.phaseInfo };
                res.render("stats/round-report", { tournament: tournamentData, roundsInfo: roundsInfo });
            }
        });
    });

    app.get("/t/:tid/stats/roundreport/dl", function (req, res, next) {
        statsController.getRoundReport(req.params.tid, req.query.phase, function (err, tournament, roundsInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.status(404).end();
            } else {
                var linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(" ", "_").toLowerCase();
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID, phaseInfo: tournament.phaseInfo };
                res.render("stats/round-report-simple", { tournament: tournamentData, roundsInfo: roundsInfo, linkName: linkTournamentName });
            }
        });
    });

    app.get('/t/:tid/stats/filter/teams', function (req, res) {
        var constraints = {};
        constraints.teams = req.query.teams;
        if (req.query.minround.length == 0) {
            constraints.minround = Number.NEGATIVE_INFINITY;
        } else {
            constraints.minround = req.query.minround;
        }
        if (req.query.maxround.length == 0) {
            constraints.maxround = Number.POSITIVE_INFINITY;
        } else {
            constraints.maxround = req.query.maxround;
        }
        statsController.getFilteredTeamsInformation(req.params.tid, constraints, function (err, tournament, teamInfo) {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                tournament.divisions = [];
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme, divisions: tournament.divisions };
                res.render("stats/quick-teams", { tournament: tournamentData, teamInfo: teamInfo, custom: true });
            }
        });
    });

    app.get("/t/:tid/stats/filter/players", function (req, res) {
        var constraints = {};
        constraints.teams = req.query.teams;
        if (req.query.minround.length == 0) {
            constraints.minround = Number.NEGATIVE_INFINITY;
        } else {
            constraints.minround = req.query.minround;
        }
        if (req.query.maxround.length == 0) {
            constraints.maxround = Number.POSITIVE_INFINITY;
        } else {
            constraints.maxround = req.query.maxround;
        }
        statsController.getFilteredPlayersInformation(req.params.tid, constraints, function (err, tournament, playersInfo) {
            if (err) {
                res.send(err);
            } else if (tournament == null) {
                res.status(404).send("Couldn't find that tournament");
            } else {
                var tournamentData = { tournament_name: tournament.tournament_name, shortID: tournament.shortID,
                    pointScheme: tournament.pointScheme };
                res.render("stats/quick-players", { tournament: tournamentData, playersInfo: playersInfo, custom: true });
            }
        });
    });

    app.get("/t/:tid/export/qbj", function (req, res) {
        statsController.convertToQuizbowlSchema(req.params.tid, function (err, json) {
            if (err) {
                res.status(500).end();
            } else if (!json) {
                res.status(404).end();
            } else {
                res.status(200).set("Content-Type", "application/vnd.quizbowl.qbj+json").send(json);
            }
        });
    });

    app.get("/t/:tid/export/scoresheets", function (req, res) {
        statsController.exportScoresheets(req.params.tid, function (err, scoresheets) {
            if (err) {
                res.status(500).end();
            } else if (!scoresheets) {
                res.status(404).end();
            } else {
                res.status(200).send({ scoresheets: scoresheets.rounds, pointScheme: scoresheets.pointScheme });
            }
        });
    });

    // app.get("*", (req, res, next) => {
    //     res.status(404).render("index/not-found", {tournamentd : req.session.director, msg : "That page doesn't exist."});
    // });
};