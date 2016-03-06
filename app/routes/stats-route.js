'use strict';

const mongoose = require("mongoose");
const Tournament = mongoose.model("Tournament");
const statsController = require("../../app/controllers/stats-controller");

module.exports = app => {

    app.get("/search", (req, res) => {
        res.render("search", {tournamentd : req.session.director});
    });

    app.get("/search/submit", (req, res) => {
        statsController.findTournamentsByNameAndSet(req.query.t_name, req.query.t_qset, function(err, tournaments) {
            if (err) {
                console.log(err);
                res.status(500).end();
            } else {
                res.render("tournament-search-result", {tournaments : tournaments});
            }
        });
    });

    app.get("/t/:tid/stats", (req, res, next) => {
        const tournament = req.params.tid;
        res.redirect("/t/" + tournament + "/stats/team?phase=1");
    });

    app.get("/t/:tid/stats/team", (req, res, next) => {
        statsController.getTeamsInfo(req.params.tid, req.query.phase, (err, tournament, teamInfo) => {
            if (err) {
                res.status(500).send(err);
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, divisions : tournament.divisions, phaseInfo : tournament.phaseInfo};
                res.render("quick-teams", {tournament : tournamentData, teamInfo : teamInfo, custom : false});
            }
        });
    });

    app.get("/t/:tid/stats/team/dl", (req, res, next) => {
        statsController.getTeamsInfo(req.params.tid, req.query.phase, (err, tournament, teamInfo) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                const linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(/\s/g, "_").toLowerCase();
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, divisions : tournament.divisions, phaseInfo : tournament.phaseInfo};
                res.render("quick-teams-simple", {tournament : tournamentData, teamInfo : teamInfo, linkName : linkTournamentName});
            }
        });
    });

    app.get("/t/:tid/stats/player", (req, res, next) => {
        statsController.getPlayersInfo(req.params.tid, req.query.phase, (err, tournament, playersInfo) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, phaseInfo : tournament.phaseInfo};
                res.render("quick-players", {tournament : tournamentData, playersInfo : playersInfo, custom : false});
            }
        });
    });

    app.get("/t/:tid/stats/player/dl", (req, res, next) => {
        statsController.getPlayersInfo(req.params.tid, req.query.phase, (err, tournament, playersInfo) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                const linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(" ", "_").toLowerCase();
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, phaseInfo : tournament.phaseInfo};
                res.render("quick-players-simple", {tournament : tournamentData, playersInfo : playersInfo, linkName : linkTournamentName});
            }
        });
    });

    app.get("/t/:tid/stats/teamfull", (req, res, next) => {
        statsController.getFullTeamsGameInformation(req.params.tid, req.query.phase, (err, tournament, teamsGames, playersInfo, teamTotals) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, phaseInfo : tournament.phaseInfo};
                res.render("full-teams", {tournament : tournamentData, teamsGames : teamsGames, playersInfo : playersInfo, teamTotals : teamTotals});
            }
        });
    });

    app.get("/t/:tid/stats/teamfull/dl", (req, res, next) => {
        statsController.getFullTeamsGameInformation(req.params.tid, req.query.phase, (err, tournament, teamsGames, playersInfo, teamTotals) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                const linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(" ", "_").toLowerCase();
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, phaseInfo : tournament.phaseInfo};
                res.render("full-team-simple", {tournament : tournamentData, teamsGames : teamsGames, playersInfo : playersInfo, teamTotals : teamTotals,
                    linkName : linkTournamentName});
            }
        });
    });

    app.get("/t/:tid/stats/playerfull", (req, res, next) => {
        statsController.getFullPlayersGameInformation(req.params.tid, req.query.phase, (err, tournament, playersInfo, playerTotals) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, phaseInfo : tournament.phaseInfo};
                res.render("full-player", {playersInfo : playersInfo, tournament : tournamentData, playerTotals : playerTotals});
            }
        });
    });

    app.get("/t/:tid/stats/playerfull/dl", (req, res, next) => {
        statsController.getFullPlayersGameInformation(req.params.tid, req.query.phase, (err, tournament, playersInfo, playerTotals) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                const linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(" ", "_").toLowerCase();
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, phaseInfo : tournament.phaseInfo};
                res.render("full-players-simple", {playersInfo : playersInfo, tournament : tournamentData, playerTotals : playerTotals,
                    linkName : linkTournamentName});
            }
        });
    });

    app.get("/t/:tid/stats/roundreport", (req, res, next) => {
        statsController.getRoundReport(req.params.tid, req.query.phase, (err, tournament, roundsInfo) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.status(404).end();
            } else {
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID, phaseInfo : tournament.phaseInfo};
                res.render("round-report", {tournament : tournamentData, roundsInfo : roundsInfo});
            }
        });
    });

    app.get("/t/:tid/stats/roundreport/dl", (req, res, next) => {
        statsController.getRoundReport(req.params.tid, req.query.phase, (err, tournament, roundsInfo) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.status(404).end();
            } else {
                const linkTournamentName = tournament.tournament_name.replace(/\s/g, "_").toLowerCase() + "_" + tournament.phaseInfo.name.replace(" ", "_").toLowerCase();
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID, phaseInfo : tournament.phaseInfo};
                res.render("round-report-simple", {tournament : tournamentData, roundsInfo : roundsInfo, linkName : linkTournamentName});
            }
        });
    });

    app.get('/t/:tid/stats/filter/teams', (req, res) => {
        const constraints = {};
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
        statsController.getFilteredTeamsInformation(req.params.tid, constraints, (err, tournament, teamInfo) => {
            if (err) {
                res.status(500).end();
            } else if (tournament == null) {
                res.send("Couldn't find that tournament");
            } else {
                tournament.divisions = [];
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme, divisions : tournament.divisions};
                res.render("quick-teams", {tournament : tournamentData, teamInfo : teamInfo, custom : true});
            }
        });
    });

    app.get("/t/:tid/stats/filter/players", (req, res) => {
        const constraints = {};
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
        statsController.getFilteredPlayersInformation(req.params.tid, constraints, (err, tournament, playersInfo) => {
            if (err) {
                res.send(err);
            } else if (tournament == null) {
                res.status(404).send("Couldn't find that tournament");
            } else {
                const tournamentData = {tournament_name : tournament.tournament_name, shortID : tournament.shortID,
                    pointScheme : tournament.pointScheme};
                res.render("quick-players", {tournament : tournamentData, playersInfo : playersInfo, custom : true});
            }
        });
    });

    app.get("/t/:tid/export/qbj", (req, res) => {
        statsController.convertToQuizbowlSchema(req.params.tid, (err, json) => {
            if (err) {
                res.status(500).end();
            } else if (!json) {
                res.status(404).end();
            } else {
                res.status(200).set("Content-Type", "application/vnd.quizbowl.qbj+json").send(json);
            }
        });
    });

    // app.get("/t/:tid/export/sqbs", (req, res) => {
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

    app.get("/t/:tid/export/scoresheets", (req, res) => {
        statsController.exportScoresheets(req.params.tid, (err, scoresheets) => {
            if (err) {
                res.status(500).end();
            } else if (!scoresheets) {
                res.status(404).end();
            } else {
                res.status(200).send({scoresheets : scoresheets.rounds, pointScheme : scoresheets.pointScheme});
            }
        });
    });

    app.get("*", (req, res, next) => {
        res.status(404).render("not-found", {tournamentd : req.session.director, msg : "That page doesn't exist."});
    });
};
