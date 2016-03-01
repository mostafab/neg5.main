'use strict';

const mongoose = require("mongoose");
const shortid = require("shortid");
const Tournament = mongoose.model("Tournament");

const tournamentController = require('../../app/controllers/tournament-controller');
const registrationController = require("../../app/controllers/registration-controller");
const statsController = require("../../app/controllers/stats-controller");

module.exports = app => {

    app.get("/t", (req, res, next) => {
        res.redirect("/tournaments");
    });

    app.get("/tournaments", (req, res, next) => {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            tournamentController.findTournamentsByDirector(req.session.director._id, (err, result) => {
                if (err) {
                    console.log(err);
                    res.status(500).send({err : err});
                } else {
                    res.render("alltournaments", {tournaments : result, tournamentd : req.session.director});
                }
            });
        }
    });

    app.post("/tournaments/edit", (req, res, next) => {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            tournamentController.updateTournamentInformation(req.body.tournamentid, req.body, req.session.director._id, (err, unauthorized) => {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                } else if (unauthorized) {
                    res.status(401).end();
                } else {
                    res.status(200).send({err : null});
                }
            });
        }
    });

    app.route('/create')
        .get((req, res, next) => {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                res.render("create", {tournamentd : req.session.director});
            }
        });

    app.post("/t/:tid/delete", (req, res) => {
        if (!req.session.director) {
            return res.status(401).redirect("/");
        }
        tournamentController.deleteTournament(req.session.director._id, req.params.tid, (err, status) => {
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

    app.post("/tournaments/removephase", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.removePhase(req.body.tid, req.body.phaseID, req.session.director._id, (err, unauthorized, removed) => {
            if (err) {
                res.status(500).end();
            } else if (unauthorized) {
                res.status(401).end();
            } else {
                res.send({removed : removed});
            }
        });
    });

    app.post("/tournaments/switchphases", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.switchPhases(req.body.tid, req.body.newPhaseID, req.session.director._id, (err, unauthorized, switched) => {
            if (err) {
                res.status(500).end();
            } else if (unauthorized) {
                res.status(401).end();
            } else {
                res.send({switched : switched});
            }
        });
    });

    app.post("/tournaments/editphases", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        const phases = !req.body.phases ? [] : req.body.phases.map(phase => {
            const editedPhase = phase;
            editedPhase.active = phase.active == 'true' ? true : false;
            return editedPhase;
        });
        tournamentController.editPhases(req.body.tid, req.session.director._id, phases, (err, unauthorized, tournament) => {
            if (err) {
                res.status(500).end();
            } else if (unauthorized) {
                res.status(401).end();
            } else if (!tournament) {
                res.status(404).end();
            } else {
                tournament.teamMap = statsController.makeTeamMap(tournament.teams);
                res.render("game-list", {tournament : tournament, admin : true}, (err, gameHTML) => {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    } else {
                        res.render("team-list", {tournament : tournament, admin : true}, (err, teamHTML) => {
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                            } else {
                                res.send({gameHTML : gameHTML, teamHTML : teamHTML, phases : tournament.phases});
                            }
                        });
                    }
                });
            }
        });
    });

    app.post("/tournaments/newphase", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.newPhase(req.body.tournamentid, req.body.phaseName, (err, newPhase) => {
            if (err) {
                return res.status(401).end();
            } else {
                res.send({newPhase : newPhase});
            }
        });
    });

    app.post("/tournaments/merge", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.mergeTournaments(req.body.first, req.body.second, req.body.name, (err, merged) => {
            res.send(merged);
        });
    });

    app.get("/tournaments/findDirectors", (req, res, next) => {
        tournamentController.findDirectors(req.query.collab, (err, directors) => {
            if (err) {
                res.status(500).send({err : err});
            } else {
                res.status(200).send({directors : directors});
            }
        });
    });

    app.post("/tournaments/addCollaborator", (req, res, next) => {
        const collaborator = JSON.parse(req.body.collaborators);
        collaborator.admin = !req.body.admin ? false : true;
        tournamentController.addCollaborator(req.body.tournamentid, collaborator, (err, duplicate) => {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).send({duplicate : duplicate, collab : collaborator});
            }
        });
    });

    app.post("/tournaments/removeCollab", (req, res, next) => {
        tournamentController.removeCollaborator(req.body.tournamentid, req.body.collab, err => {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).send({err : null});
            }
        });
    });

    app.get("/tournaments/findCollaborators", (req, res, next) => {
        tournamentController.findCollaborators(req.query.tournamentid, (err, collaborators) => {
            if (err) {
                return res.status(500).send({collabs : []});
            } else {
                return res.status(200).send({collabs : collaborators});
            }
        });
    });

    app.post("/tournaments/editPointSchema", (req, res, next) => {
        const newPointValues = {};
        const newPointTypes = JSON.parse(req.body.pointtypes);
        let playerNum = 1;
        let currentVal = "pointval" + playerNum
        while (req.body[currentVal] != undefined) {
            if (req.body[currentVal].length !== 0) {
                newPointValues[req.body[currentVal]] = 0;
            }
            playerNum++;
            currentVal = "pointval" + playerNum;
        }
        tournamentController.changePointScheme(req.body["tournamentid"], newPointValues, newPointTypes, err => {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).send({err : null});
            }
        });
    });

    app.post("/tournaments/editDivisions", (req, res, next) => {
        const divisions = !req.body.divisions ? [] : req.body.divisions;
        tournamentController.updateDivisions(req.body.tid, divisions, (err, newDivisions) => {
            if (err) {
                res.status(500).end();
            } else {
                res.status(200).send({divisions : newDivisions});
            }
        });
    });

    app.route("/tournaments/createteam")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.status(401).end();
            } else {
                const id = req.body.tid;
                tournamentController.addTeamToTournament(id, req.body.teamInfo, (err, tournament) => {
                    if (err) {
                        res.status(500).end();
                    } else {
                        let admin = false;
                        if (req.session.director._id == tournament.directorid) {
                            admin = true;
                        }
                        if (!admin) {
                            tournament.collaborators.forEach(collab => {
                                if (collab.id == req.session.director._id && collab.admin) {
                                    admin = true;
                                }
                            });
                        }
                        res.render("team-list", {tournament : tournament, admin : admin}, (err, html) => {
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                            } else {
                                res.send({html : html, teams : tournament.teams});
                            }
                        });
                    }
                });
            }
        });

    app.route("/tournaments/creategame")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.status(401).end();
            } else {
                const id = req.body["tournament_id_form"];
                tournamentController.addGameToTournament(id, req.body, [], (err, tournament, newGame) => {
                    if (err) {
                        res.status(500).end();
                    } else {
                        let admin = false;
                        if (req.session.director._id == tournament.directorid) {
                            admin = true;
                        }
                        if (!admin) {
                            for (let i = 0; i < tournament.collaborators.length; i++) {
                                if (tournament.collaborators[i].id == req.session.director._id && tournament.collaborators[i].admin) {
                                    admin = true;
                                    break;
                                }
                            }
                        }
                        res.render("game-list", {tournament : tournament, admin : admin});
                    }
                });
            }
        });

    app.post("/tournaments/scoresheet/submit", (req, res) => {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            tournamentController.addScoresheetAsGame(req.body.tournamentid, req.body.game, req.body.scoresheet, (err, gameid) => {
                if (err) {
                    res.status(500).end();
                } else {
                    res.status(200).send({gameid : gameid});
                }
            });
        }
    });

    app.route("/tournaments/teams/remove")
        .post((req, res, next) => {
            tournamentController.removeTeamFromTournament(req.body["tournament_idteam"], req.body, (err, removedInfo) => {
                if (err) {
                    console.log(err);
                    res.status(500).end();
                } else {
                    res.status(200).send(removedInfo);
                }
            });
        });

    app.route("/tournaments/games/remove")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                const gameid = req.body["gameid_form"];
                const tournamentid = req.body["tournament_idgame"];
                tournamentController.removeGameFromTournament(tournamentid, gameid, (err, phases) => {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    } else {
                        res.status(200).send("Good to go");
                    }
                });
            }
        });

    app.route("/tournaments/players/remove")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.status(401).send({msg : "Hmm, doesn't seem like you're logged in."});
            } else {
                tournamentController.removePlayer(req.body.tournamentidform, req.body.playerid, err => {
                    if (err) {
                        res.status(500).send({err : err, msg : "Something went wrong"});
                    } else {
                        res.status(200).send({err : null, msg : "Successfully removed player."});
                    }
                });
            }
        });

    app.route("/tournaments/games/edit")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.status(401).end();
            } else {
                const tournamentid = req.body["tournament_id_form"];
                const gameid = req.body["oldgameid"];
                tournamentController.removeGameFromTournament(tournamentid, gameid, (err, phases) => {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    } else {
                        tournamentController.addGameToTournament(tournamentid, req.body, phases, (err, tournament, game) => {
                            if (err) {
                                console.log(err);
                                res.status(500).end();
                            } else {
                                tournamentController.changeGameShortID(tournamentid, game.shortID, gameid, err => {
                                    if (err) {
                                        res.status(500).end();
                                    } else {
                                        res.status(200).send({err : null});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    app.get("/t/:tid/scoresheet", (req, res, next) => {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            tournamentController.loadTournamentScoresheet(req.params.tid, (err, tournament) => {
                if (err) {
                    res.status(500).send({err : err});
                } else if (!tournament) {
                    res.status(404).render("not-found", {tournamentd : req.session.director, msg : "That tournament doesn't exist."});
                } else {
                    const hasPermission = getPermission(tournament, req.session.director);
                    if (hasPermission.permission) {
                        res.render("scoresheet", {tournamentd : req.session.director, tournamentName : tournament.tournament_name, tid : tournament._id,
                            shortID : tournament.shortID, teams : tournament.teams, maxRound : tournament.maxRound, phases : tournament.phases});
                    } else {
                        res.status(401).send("You don't have permission to view this tournament");
                    }
                }
            });
        }
    });

    app.route("/tournaments/teams/edit")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.status(401).end();
            } else {
                const tournamentid = req.body.tid;
                const teamid = req.body.teamInfo.teamID;
                tournamentController.updateTeam(tournamentid, teamid, req.body.teamInfo, (err, team) => {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    } else if (!team){
                        res.status(200).send({team : null, msg : "A team with that name already exists."});
                    } else {
                        res.status(200).send({team : team, msg : "Successfully updated team."});
                    }
                });
            }
        });

    app.route("/tournaments/players/edit")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.status(401).end();
            } else {
                tournamentController.updatePlayer(req.body.tournamentidform, req.body.playerid, req.body.playername, err => {
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.status(200).send({err : null, msg : "Successfully updated player"});
                    }
                });
            }
        });

    app.route("/tournaments/players/create")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.status(401).end();
            } else {
                tournamentController.addPlayer(req.body.tournamentidform, req.body.teamnameform, req.body.teamidform, req.body.newplayername, (err, player, pointScheme, pointTypes) => {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    } else {
                        res.status(200).send({
                            err : null,
                            player : player,
                            msg : "Successfully added player",
                            tid : req.body.tournamentidform,
                            pointScheme : pointScheme,
                            pointTypes : pointTypes
                        });
                    }
                });
            }
        });

    app.route("/create/submit")
        .post((req, res, next) => {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                const name = req.body.t_name;
                const location = req.body.t_location;
                const description = req.body.t_description;
                const date = req.body.t_date;
                const questionset = req.body.t_qset;
                tournamentController.addTournament(req.session.director, name, date, location, description, questionset, (err, ref) => {
                    if (err) {
                        res.redirect("/create");
                    } else {
                        res.redirect("/t/" + ref);
                    }
                });
            }
        });

    app.route("/tournaments/getplayers")
        .get((req, res, next) => {
            if (!req.session.director) {
                res.status(401).end();
            } else {
                const id = req.query["tournamentid"];
                const teamname = req.query["teamname"];
                tournamentController.findTeamMembers(id, teamname, (err, players, pointScheme, pointTypes) => {
                    if (err) {
                        console.log(err);
                        res.status(500).end();
                    } else {
                        res.status(200).send({players : players, pointScheme : pointScheme, pointTypes : pointTypes});
                    }
                });
            }
        });

    app.get("/t/:tid/teams/:teamid", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.findTournamentById(req.params.tid, (err, result) => {
            let team = null;
            if (result) {
                const hasPermission = getPermission(result, req.session.director);
                if (hasPermission.permission) {
                    for (let i = 0; i < result.teams.length; i++) {
                        if (result.teams[i].shortID == req.params.teamid) {
                            team = result.teams[i];
                            break;
                        }
                    }
                    if (team !== null) {
                        let teamPlayers = [];
                        for (let i = 0; i < result.players.length; i++) {
                            if (result.players[i].teamID == team._id) {
                                teamPlayers.push(result.players[i]);
                            }
                        }
                        const tourney = {};
                        tourney.tournament_name = result.tournament_name;
                        tourney._id = result._id;
                        tourney.directorid = result.directorid;
                        tourney.shortID = result.shortID;
                        tourney.divisions = result.divisions;
                        tourney.phases = result.phases;
                        team.record = team.getRecord(result);
                        console.log(team);
                        res.render("team-view", {team : team, teamPlayers : teamPlayers, tournament : tourney, admin : hasPermission.admin});
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

    app.get("/t/:tid/teams", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.getTeams(req.params.tid, (err, tournament) => {
            if (err) {
                return res.status(500).end();
            } else if (!tournament) {
                return res.status(404).end();
            } else {
                tournament.teamMap = statsController.makeTeamMap(tournament.teams);
                let admin = false;
                if (req.session.director._id == tournament.directorid) {
                    admin = true;
                }
                if (!admin) {
                    for (let i = 0; i < tournament.collaborators.length; i++) {
                        if (tournament.collaborators[i].id == req.session.director._id && tournament.collaborators[i].admin) {
                            admin = true;
                            break;
                        }
                    }
                }
                res.render("team-list", {tournament : tournament, admin : admin});
            }
        });
    });

    app.get("/t/:tid/games/:gid", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.findTournamentById(req.params.tid, (err, result) => {
            let game = null;
            const teamMap = statsController.makeTeamMap(result.teams);
            if (result) {
                const hasPermission = getPermission(result, req.session.director)
                if (hasPermission.permission) {
                    for (let i = 0; i < result.games.length; i++) {
                        if (result.games[i].shortID == req.params.gid) {
                            game = result.games[i];
                            break;
                        }
                    }
                    if (game !== null) {
                        game.team1.team_name = teamMap[game.team1.team_id].name;
                        game.team2.team_name = teamMap[game.team2.team_id].name;
                        let team1Players = [];
                        let team2Players = [];
                        for (let i = 0; i < result.players.length; i++) {
                            if (result.players[i].teamID == game.team1.team_id) {
                                team1Players.push(result.players[i]);
                            } else if (result.players[i].teamID == game.team2.team_id) {
                                team2Players.push(result.players[i]);
                            }
                        }
                        res.render("game-view", {game : game, tournamentName : result.tournament_name,
                            team1Players : team1Players, team2Players : team2Players, tournament : result});
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

    app.get("/t/:tid/games", (req, res) => {
        if (!req.session.director) {
            return res.status(401).end();
        }
        tournamentController.getGames(req.params.tid, (err, tournament) => {
            if (err) {
                return res.status(500).end();
            } else if (!tournament) {
                return res.status(404).end();
            } else {
                const hasPermission = getPermission(tournament, req.session.director);
                if (hasPermission.permission) {
                    tournament.teamMap = statsController.makeTeamMap(tournament.teams);
                    return res.render('game-list', {tournament : tournament, admin : hasPermission.admin});
                } else {
                    return res.status(401).end();
                }
            }
        });
    });

    app.get("/t/:tid", (req, res, next) => {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            tournamentController.findTournamentById(req.params.tid, (err, result, director) => {
                if (err) {
                    res.status(500).send(err);
                } else if (result == null) {
                    res.status(404).render("not-found", {tournamentd : req.session.director, msg : "That tournament doesn't exist."});
                } else {
                    const hasPermission = getPermission(result, req.session.director);
                    if (hasPermission.permission) {
                        const linkName = result.tournament_name.replace(/\s/g, "_").toLowerCase();
                        res.render("tournament-view", {tournament : result, tournamentd : req.session.director, linkName : linkName,
                            admin : hasPermission.admin, tournamentDirector : director});
                    } else {
                        res.status(401).send("You don't have permission to view this tournament");
                    }
                }
            });
        }
    });

    app.get('/shortid', (req, res) => {
        res.send(shortid.generate());
    });


};

/**
* Checks if user is going to specific tournament (in which case the query will be filled)
* or going to all tournaments (in which case query will be empty)
* @return true if empty query, false otherwise
*/
function checkEmptyQuery(query) {
    for (let key in query) {
        if (key) {
            return false;
        }
    }
    return true;
}

function getPermission(tournament, director) {
    if (!director) {
        return {permission : false, admin : false};
    }
    if (tournament.directorid == director._id) {
        return {permission : true, admin : true};
    }
    for (let i = 0; i < tournament.collaborators.length; i++) {
        if (director._id == tournament.collaborators[i].id && tournament.collaborators[i].admin) {
            return {permission : true, admin : true};
        } else if (director._id == tournament.collaborators[i].id) {
            return {permission : true, admin : false};
        }
    }
    return {permission : false, admin : false};
}
