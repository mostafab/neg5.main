'use strict';

var _token = require("./../auth/middleware/token");

var mongoose = require("mongoose");
var shortid = require("shortid");
var Tournament = mongoose.model("Tournament");

var tournamentController = require('../controllers/tournament-controller');
var registrationController = require("../controllers/registration-controller");
var statsController = require("../controllers/stats-controller");

module.exports = function (app) {

    app.get("/t", function (req, res, next) {
        res.redirect("/tournaments");
    });

    app.post("/tournaments/edit", function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            tournamentController.updateTournamentInformation(req.body.tournamentid, req.body, req.session.director._id, function (err, unauthorized) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                } else if (unauthorized) {
                    res.status(401).end();
                } else {
                    res.status(200).send({ err: null });
                }
            });
        }
    });

    app.route('/create').get(function (req, res, next) {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            res.render("tournament/create", { tournamentd: req.session.director });
        }
    });

    app.post("/t/:tid/delete", function (req, res) {
        if (!req.session.director) {
            return res.status(401).redirect("/");
        }
        tournamentController.deleteTournament(req.session.director._id, req.params.tid, function (err, status) {
            if (err) {
                console.log(err);
                res.status(500).redirect("/");
            } else if (status == "Unauthorized") {
                res.status(401).redirect("/tournaments");
            } else {
                res.status(200).redirect("/tournaments");
            }
        });
    });

    app.post("/tournaments/removephase", function (req, res) {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.removePhase(req.body.tid, req.body.phaseID, req.session.director._id, function (err, unauthorized, removed) {
            if (err) {
                res.status(500).end();
            } else if (unauthorized) {
                res.status(401).end();
            } else {
                res.send({ removed: removed });
            }
        });
    });

    app.post("/tournaments/switchphases", function (req, res) {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.switchPhases(req.body.tid, req.body.newPhaseID, req.session.director._id, function (err, unauthorized, switched) {
            if (err) {
                res.status(500).end();
            } else if (unauthorized) {
                res.status(401).end();
            } else {
                res.send({ switched: switched });
            }
        });
    });

    app.post("/tournaments/editphases", function (req, res) {
        if (!req.session.director) {
            return res.status(401).end();
        }
        var phases = !req.body.phases ? [] : req.body.phases.map(function (phase) {
            var editedPhase = phase;
            editedPhase.active = phase.active == 'true' ? true : false;
            return editedPhase;
        });
        tournamentController.editPhases(req.body.tid, req.session.director._id, phases, function (err, unauthorized, tournament) {
            if (err) {
                res.status(500).end();
            } else if (unauthorized) {
                res.status(401).end();
            } else if (!tournament) {
                res.status(404).end();
            } else {
                tournament.teamMap = statsController.makeTeamMap(tournament.teams);
                res.render("game/game-list", { tournament: tournament, admin: true }, function (err, gameHTML) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    } else {
                        res.render("team/team-list", { tournament: tournament, admin: true }, function (err, teamHTML) {
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                            } else {
                                res.send({ gameHTML: gameHTML, teamHTML: teamHTML, phases: tournament.phases });
                            }
                        });
                    }
                });
            }
        });
    });

    app.post("/tournaments/newphase", function (req, res) {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.newPhase(req.body.tournamentid, req.body.phaseName, function (err, newPhase) {
            if (err) {
                return res.status(401).end();
            } else {
                res.send({ newPhase: newPhase });
            }
        });
    });

    app.post("/tournaments/merge", function (req, res) {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.mergeTournaments(req.body.first, req.body.second, req.body.name, function (err, merged) {
            res.send(merged);
        });
    });

    app.get("/tournaments/findDirectors", function (req, res, next) {
        tournamentController.findDirectors(req.query.collab, function (err, directors) {
            if (err) {
                res.status(500).send({ err: err });
            } else {
                res.status(200).send({ directors: directors });
            }
        });
    });

    app.post("/tournaments/addCollaborator", function (req, res, next) {
        var collaborator = JSON.parse(req.body.collaborators);
        collaborator.admin = !req.body.admin ? false : true;
        tournamentController.addCollaborator(req.body.tournamentid, collaborator, function (err, duplicate) {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).send({ duplicate: duplicate, collab: collaborator });
            }
        });
    });

    app.post("/tournaments/removeCollab", function (req, res, next) {
        tournamentController.removeCollaborator(req.body.tournamentid, req.body.collab, function (err) {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).send({ err: null });
            }
        });
    });

    app.get("/tournaments/findCollaborators", function (req, res, next) {
        tournamentController.findCollaborators(req.query.tournamentid, function (err, collaborators) {
            if (err) {
                return res.status(500).send({ collabs: [] });
            } else {
                return res.status(200).send({ collabs: collaborators });
            }
        });
    });

    app.get('/api/users', function (req, res) {
        console.log(req.query.searchQuery);
        tournamentController.findDirectors(req.query.searchQuery, function (err, directors) {
            if (err) {
                res.status(500).send({ err: err });
            } else {
                res.status(200).send({ directors: directors });
            }
        });
    });

    app.route('/api/t/:tid/collaborators').get(function (req, res) {
        tournamentController.findCollaborators(req.params.tid, function (err, collaborators) {
            if (err) {
                return res.status(500).send({ error: err });
            } else {
                return res.status(200).send({ collaborators: collaborators });
            }
        });
    }).post(function (req, res) {
        res.status(200).end();
    });

    app.route('/api/t/:tid/collaborator/:collaboratorId').put(function (req, res) {}).delete(function (req, res) {
        tournamentController.removeCollaborator(req.params.tid, req.params.collaboratorId, function (err) {
            if (err) return res.status(500).send({ err: err });
            return res.status(200).send({ success: true, id: req.params.collaboratorId });
        });
    });

    app.post("/tournaments/editPointSchema", function (req, res, next) {
        var newPointValues = {};
        var newPointTypes = JSON.parse(req.body.pointtypes);
        var playerNum = 1;
        var currentVal = "pointval" + playerNum;
        while (req.body[currentVal] != undefined) {
            if (req.body[currentVal].length !== 0) {
                newPointValues[req.body[currentVal]] = 0;
            }
            playerNum++;
            currentVal = "pointval" + playerNum;
        }
        tournamentController.changePointScheme(req.body["tournamentid"], newPointValues, newPointTypes, function (err) {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).send({ err: null });
            }
        });
    });

    app.post("/tournaments/editDivisions", function (req, res, next) {
        var divisions = !req.body.divisions ? [] : req.body.divisions;
        tournamentController.updateDivisions(req.body.tid, divisions, function (err, newDivisions) {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).send({ divisions: newDivisions });
            }
        });
    });

    app.route("/tournaments/createteam").post(function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            var id = req.body.tid;
            tournamentController.addTeamToTournament(id, req.body.teamInfo, function (err, tournament) {
                if (err) {
                    res.status(500).end();
                } else {
                    var admin = false;
                    if (req.session.director._id == tournament.directorid) {
                        admin = true;
                    }
                    if (!admin) {
                        tournament.collaborators.forEach(function (collab) {
                            if (collab.id == req.session.director._id && collab.admin) {
                                admin = true;
                            }
                        });
                    }
                    res.render("team/team-list", { tournament: tournament, admin: admin }, function (err, html) {
                        if (err) {
                            console.log(err);
                            res.status(500).end();
                        } else {
                            res.send({ html: html, teams: tournament.teams });
                        }
                    });
                }
            });
        }
    });

    app.route("/tournaments/creategame").post(function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            var id = req.body["tournament_id_form"];
            tournamentController.addGameToTournament(id, req.body, [], function (err, tournament, newGame) {
                if (err) {
                    res.status(500).end();
                } else {
                    var admin = false;
                    if (req.session.director._id == tournament.directorid) {
                        admin = true;
                    }
                    if (!admin) {
                        for (var i = 0; i < tournament.collaborators.length; i++) {
                            if (tournament.collaborators[i].id == req.session.director._id && tournament.collaborators[i].admin) {
                                admin = true;
                                break;
                            }
                        }
                    }
                    res.render("game/game-list", { tournament: tournament, admin: admin });
                }
            });
        }
    });

    app.post("/tournaments/scoresheet/submit", function (req, res) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            tournamentController.addScoresheetAsGame(req.body.tournamentid, req.body.game, req.body.scoresheet, function (err, gameid) {
                if (err) {
                    res.status(500).end();
                } else {
                    res.status(200).send({ gameid: gameid });
                }
            });
        }
    });

    app.route("/tournaments/teams/remove").post(function (req, res, next) {
        tournamentController.removeTeamFromTournament(req.body["tournament_idteam"], req.body, function (err, removedInfo) {
            if (err) {
                console.log(err);
                res.status(500).end();
            } else {
                res.status(200).send(removedInfo);
            }
        });
    });

    app.get('/t/:tid/phases', function (req, res, next) {
        Tournament.findOne({ shortID: req.params.tid }, { phases: 1 }, function (err, result) {
            res.json({ phases: result.phases });
        });
    });

    app.route("/tournaments/games/remove").post(function (req, res, next) {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            var gameid = req.body["gameid_form"];
            var tournamentid = req.body["tournament_idgame"];
            tournamentController.removeGameFromTournament(tournamentid, gameid, function (err, phases) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                } else {
                    res.status(200).send("Good to go");
                }
            });
        }
    });

    app.route("/tournaments/players/remove").post(function (req, res, next) {
        if (!req.session.director) {
            res.status(401).send({ msg: "Hmm, doesn't seem like you're logged in." });
        } else {
            tournamentController.removePlayer(req.body.tournamentidform, req.body.playerid, function (err) {
                if (err) {
                    res.status(500).send({ err: err, msg: "Something went wrong" });
                } else {
                    res.status(200).send({ err: null, msg: "Successfully removed player." });
                }
            });
        }
    });

    app.route("/tournaments/games/edit").post(function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            (function () {
                var tournamentid = req.body["tournament_id_form"];
                var gameid = req.body["oldgameid"];
                tournamentController.removeGameFromTournament(tournamentid, gameid, function (err, phases) {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    } else {
                        tournamentController.addGameToTournament(tournamentid, req.body, phases, function (err, tournament, game) {
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                            } else {
                                tournamentController.changeGameShortID(tournamentid, game.shortID, gameid, function (err) {
                                    if (err) {
                                        res.status(500).end();
                                    } else {
                                        res.status(200).send({ err: null });
                                    }
                                });
                            }
                        });
                    }
                });
            })();
        }
    });

    app.get("/t/:tid/scoresheet", function (req, res, next) {
        if (!req.session.director) {
            req.session.lastURL = req.url;
            res.redirect("/");
        } else {
            tournamentController.loadTournamentScoresheet(req.params.tid, function (err, tournament) {
                if (err) {
                    res.status(500).send({ err: err });
                } else if (!tournament) {
                    res.status(404).render("index/not-found", { tournamentd: req.session.director, msg: "That tournament doesn't exist." });
                } else {
                    var hasPermission = getPermission(tournament, req.session.director);
                    if (hasPermission.permission) {
                        res.render("game/scoresheet", { tournamentd: req.session.director, tournamentName: tournament.tournament_name, tid: tournament._id,
                            shortID: tournament.shortID, teams: tournament.teams, maxRound: tournament.maxRound, phases: tournament.phases });
                    } else {
                        res.status(401).send("You don't have permission to view this tournament");
                    }
                }
            });
        }
    });

    app.route("/tournaments/teams/edit").post(function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            var tournamentid = req.body.tid;
            var teamid = req.body.teamInfo.teamID;
            tournamentController.updateTeam(tournamentid, teamid, req.body.teamInfo, function (err, team) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                } else if (!team) {
                    res.status(200).send({ team: null, msg: "A team with that name already exists." });
                } else {
                    res.status(200).send({ team: team, msg: "Successfully updated team." });
                }
            });
        }
    });

    app.route("/tournaments/players/edit").post(function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            tournamentController.updatePlayer(req.body.tournamentidform, req.body.playerid, req.body.playername, function (err) {
                if (err) {
                    res.status(500).end();
                } else {
                    res.status(200).send({ err: null, msg: "Successfully updated player" });
                }
            });
        }
    });

    app.route("/tournaments/players/create").post(function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            tournamentController.addPlayer(req.body.tournamentidform, req.body.teamnameform, req.body.teamidform, req.body.newplayername, function (err, player, pointScheme, pointTypes) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                } else {
                    res.status(200).send({
                        err: null,
                        player: player,
                        msg: "Successfully added player",
                        tid: req.body.tournamentidform,
                        pointScheme: pointScheme,
                        pointTypes: pointTypes
                    });
                }
            });
        }
    });

    app.route("/create/submit").post(function (req, res, next) {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            var name = req.body.t_name;
            var location = req.body.t_location;
            var description = req.body.t_description;
            var date = req.body.t_date;
            var questionset = req.body.t_qset;
            tournamentController.addTournament(req.session.director, name, date, location, description, questionset, function (err, ref) {
                if (err) {
                    res.redirect("/create");
                } else {
                    res.redirect("/t/" + ref);
                }
            });
        }
    });

    app.route("/tournaments/getplayers").get(function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            var id = req.query["tournamentid"];
            var teamname = req.query["teamname"];
            tournamentController.findTeamMembers(id, teamname, function (err, players, pointScheme, pointTypes) {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                } else {
                    res.status(200).send({ players: players, pointScheme: pointScheme, pointTypes: pointTypes });
                }
            });
        }
    });

    app.get("/api/t/:tid/teams/:teamid", function (req, res) {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.findTournamentById(req.params.tid, function (err, result) {
            var team = null;
            if (result) {
                var hasPermission = getPermission(result, req.session.director);
                if (hasPermission.permission) {
                    for (var i = 0; i < result.teams.length; i++) {
                        if (result.teams[i].shortID == req.params.teamid) {
                            team = result.teams[i];
                            break;
                        }
                    }
                    if (team !== null) {
                        var teamPlayers = result.players.filter(function (player) {
                            return player.teamID == team._id;
                        });
                        res.json({ team: team, players: teamPlayers });
                        // const tourney = {};
                        // tourney.tournament_name = result.tournament_name;
                        // tourney._id = result._id;
                        // tourney.directorid = result.directorid;
                        // tourney.shortID = result.shortID;
                        // tourney.divisions = result.divisions;
                        // tourney.phases = result.phases;
                        // team.record = team.getRecord(result);
                        // team.ppg = team.getPointsPerGame(result);
                        // team.papg = team.getOpponentPPG(result);
                        // team.ppb = team.getOverallPPB(result);
                        // res.render("team/team-view", {team : team, teamPlayers : teamPlayers, tournament : tourney, admin : hasPermission.admin});
                    } else {
                            res.status(404).end();
                        }
                } else {
                    res.status(401).end();
                }
            } else {
                res.status(404).end();
            }
        });
    });

    // app.get("/t/:tid/teams", (req, res) => {
    //     if (!req.session.director) {
    //         return res.status(401).end();
    //     }
    //     tournamentController.getTeams(req.params.tid, (err, tournament) => {
    //         if (err) {
    //             return res.status(500).end();
    //         } else if (!tournament) {
    //             return res.status(404).end();
    //         } else {
    //             tournament.teamMap = statsController.makeTeamMap(tournament.teams);
    //             let admin = false;
    //             if (req.session.director._id == tournament.directorid) {
    //                 admin = true;
    //             }
    //             if (!admin) {
    //                 for (let i = 0; i < tournament.collaborators.length; i++) {
    //                     if (tournament.collaborators[i].id == req.session.director._id && tournament.collaborators[i].admin) {
    //                         admin = true;
    //                         break;
    //                     }
    //                 }
    //             }
    //             res.json({teams: tournament.teams, admin: admin})
    //         }
    //     });
    // });

    app.get("/t/:tid/games/:gid", function (req, res) {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.findTournamentById(req.params.tid, function (err, result) {
            var game = null;
            var teamMap = statsController.makeTeamMap(result.teams);
            if (result) {
                var hasPermission = getPermission(result, req.session.director);
                if (hasPermission.permission) {
                    for (var i = 0; i < result.games.length; i++) {
                        if (result.games[i].shortID == req.params.gid) {
                            game = result.games[i];
                            break;
                        }
                    }
                    if (game !== null) {
                        game.team1.team_name = teamMap[game.team1.team_id].name;
                        game.team2.team_name = teamMap[game.team2.team_id].name;
                        var team1Players = [];
                        var team2Players = [];
                        for (var _i = 0; _i < result.players.length; _i++) {
                            if (result.players[_i].teamID == game.team1.team_id) {
                                team1Players.push(result.players[_i]);
                            } else if (result.players[_i].teamID == game.team2.team_id) {
                                team2Players.push(result.players[_i]);
                            }
                        }
                        res.render("game/game-view", { game: game, tournamentName: result.tournament_name,
                            team1Players: team1Players, team2Players: team2Players, tournament: result });
                    } else {
                        res.status(404).end();
                    }
                } else {
                    res.status(401).end();
                }
            } else {
                res.status(404).end();
            }
        });
    });

    app.get("/t/:tid/games", function (req, res) {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.getGames(req.params.tid, function (err, tournament) {
            if (err) {
                return res.status(500).end();
            } else if (!tournament) {
                return res.status(404).end();
            } else {
                var hasPermission = getPermission(tournament, req.session.director);
                if (hasPermission.permission) {
                    (function () {
                        var teamMap = statsController.makeTeamMap(tournament.teams);
                        tournament.games.forEach(function (game) {
                            game.team1.name = teamMap[game.team1.team_id].team_name;
                            game.team2.name = teamMap[game.team2.team_id].team_name;
                        });
                        res.json({ games: tournament.games });
                    })();
                } else {
                    return res.status(401).end();
                }
            }
        });
    });

    app.get("/t/:tid", _token.hasToken, function (req, res, next) {
        // if (!req.session.director) {
        //     req.session.lastURL = req.url;
        //     res.redirect("/");
        // } else {
        //     // tournamentController.findTournamentById(req.params.tid, (err, result, director) => {
        //     //     if (err) {
        //     //         res.status(500).send(err);
        //     //     } else if (result == null) {
        //     //         res.status(404).render("index/not-found", {tournamentd : req.session.director, msg : "That tournament doesn't exist."});
        //     //     } else {
        //     //         const hasPermission = getPermission(result, req.session.director);
        //     //         if (hasPermission.permission) {
        //     //             const linkName = result.tournament_name.replace(/\s/g, "_").toLowerCase();
        //     //             res.render("tournament/tournament-view", {tournament : result, tournamentd : req.session.director, linkName : linkName,
        //     //                 admin : hasPermission.admin, tournamentDirector : director});
        //     //         } else {
        //     //             res.status(401).send("You don't have permission to view this tournament");
        //     //         }
        //     //     }
        //     // });

        // }
        res.render("tournament/tournament-view", { tournamentd: req.currentUser });
    });
};

/**
* Checks if user is going to specific tournament (in which case the query will be filled)
* or going to all tournaments (in which case query will be empty)
* @return true if empty query, false otherwise
*/
function checkEmptyQuery(query) {
    for (var key in query) {
        if (key) {
            return false;
        }
    }
    return true;
}

function getPermission(tournament, director) {
    if (!director) {
        return { permission: false, admin: false };
    }
    if (tournament.directorid == director._id) {
        return { permission: true, admin: true };
    }
    for (var i = 0; i < tournament.collaborators.length; i++) {
        if (director._id == tournament.collaborators[i].id && tournament.collaborators[i].admin) {
            return { permission: true, admin: true };
        } else if (director._id == tournament.collaborators[i].id) {
            return { permission: true, admin: false };
        }
    }
    return { permission: false, admin: false };
}