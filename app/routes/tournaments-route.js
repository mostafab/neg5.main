var tournamentController = require('../../app/controllers/tournament-controller');
var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");

module.exports = function(app) {

    app.route('/home/tournaments/create')
        .get(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                res.render("create", {tournamentd : req.session.director});
            }
        });

    app.post("/home/tournaments/editPointSchema", function(req, res, next) {
        // console.log(req.body);
        var newPointValues = {};
        var playerNum = 1;
        currentVal = "pointval" + playerNum
        while (req.body[currentVal] != undefined) {
            // console.log(req.body[currentVal]);
            if (req.body[currentVal].length !== 0) {
                newPointValues[req.body[currentVal]] = 0;
            }
            playerNum++;
            currentVal = "pointval" + playerNum;
        }
        // console.log(newPointValues);
        tournamentController.changePointScheme(req.body["tournamentid"], newPointValues, function(err) {
            if (err) {
                res.status(500).send({err : err});
            } else {
                res.status(200).send({err : null});
            }
        });

    });

    app.route("/home/tournaments/createteam")
        .post(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                var id = req.body["tournament_id"];
                tournamentController.addTeamToTournament(id, req.body, function(err, teams, newTeam) {
                    if (err) {
                        // DO STUFF
                    } else {
                        res.send({"teams" : teams, "newTeam" : newTeam});
                    }
                });
            }
        });

    app.route("/home/tournaments/creategame")
        .post(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                var id = req.body["tournament_id_form"];
                tournamentController.addGameToTournament(id, req.body, function(err, games) {
                    if (err) {
                        // DO STUFF
                        res.status(500).send({game : null, tid : id});
                    } else {
                        res.status(200).send({game : games, tid : id});
                    }
                });
            }
        });

    app.route("/home/tournaments/teams/remove")
        .post(function(req, res, next) {
            console.log(req.body);
            tournamentController.removeTeamFromTournament(req.body["tournament_idteam"], req.body, function(err, teamid) {
                if (err) {
                    res.status(500).send({"err" : err, "teamid" : teamid});
                } else {
                    res.status(200).send({"err" : null, "teamid" : teamid});
                }
            });
        });

    app.route("/home/tournaments/games/remove")
        .post(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                var gameid = req.body["gameid_form"];
                console.log(gameid);
                var tournamentid = req.body["tournament_idgame"];
                console.log(tournamentid);
                tournamentController.getGameFromTournament(tournamentid, gameid, function(err) {
                    if (err) {
                        res.status(500).end();
                    } else {
                        res.status(200).send("Good to go");
                    }
                });
            }
        });

    app.route("/home/tournaments/players/remove")
        .post(function(req, res, next) {
            console.log(req.body);
            if (!req.session.director) {
                res.status(401).send({msg : "Hmm, doesn't seem like you're logged in."});
            } else {
                tournamentController.removePlayer(req.body.tournamentidform, req.body.playerid, function(err) {
                    if (err) {
                        res.status(500).send({err : err, msg : "Something went wrong"});
                    } else {
                        res.status(200).send({err : null, msg : "Successfully removed player."});
                    }
                });
            }
        });

    app.route("/home/tournaments/games/edit")
        .post(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                // console.log(req.body);
                var tournamentid = req.body["tournament_id_form"];
                var gameid = req.body["oldgameid"];
                tournamentController.getGameFromTournament(tournamentid, gameid, function(err) {
                    if (err) {
                        res.status(500).send({err : err});
                    } else {
                        tournamentController.addGameToTournament(tournamentid, req.body, function(err, game) {
                            if (err) {
                                res.status(500).send({err : err});
                            } else {
                                tournamentController.changeGameShortID(tournamentid, game.shortID, gameid, function(err) {
                                    if (err) {
                                        res.status(500).send({err : err});
                                    } else {
                                        res.status(200).send({err : null});
                                    }
                                });
                            }
                        });
                    }
                });
                // tournamentController.addGameToTournament(tournamentid, req.body, function(err, game) { // Adds in the new game
                //     if (err) {
                //         res.status(500).send({err : err});
                //         console.log(err);
                //     } else {
                //         console.log("New game short id: " + game.shortID);
                //         tournamentController.getGameFromTournament(tournamentid, gameid, function(err) { // Removes the old game
                //             if (err) {
                //                 res.status(500).send({err : err});
                //             } else {
                //                 tournamentController.changeGameShortID(tournamentid, game.shortID, gameid, function(err) { // Sets the shortID
                //                     if (err) {
                //                         res.status(500).send({err : err});
                //                     } else {
                //                         res.status(200).send({err : null}); // Need to send game to update the new gameid field
                //                     }
                //                 });
                //             }
                //         });
                //     }
                // });
            }
        });

    app.route("/home/tournaments/teams/edit")
        .post(function(req, res, next) {
            if (!req.session.director) {
                res.status(401).send({team : null, msg : "Hmm, doesn't seem like you're logged in."});
            } else {
                var tournamentid = req.body["tournamentid"];
                var teamid = req.body["teamid"];
                tournamentController.updateTeam(tournamentid, teamid, req.body, function(err, team) {
                    if (err) {
                        res.status(500).send({err : err, team : null, msg : "Could not connect."});
                        console.log(err);
                    } else if (!team){
                        res.status(200).send({team : null, msg : "A team with that name already exists."});
                    } else {
                        res.status(200).send({team : team, msg : "Successfully updated team."});
                    }
                });
            }
        });

    app.route("/home/tournaments/players/edit")
        .post(function(req, res, next) {
            if (!req.session.director) {
                res.status(401).send({msg : "Hmm, doesn't seem like you're logged in. "});
            } else {
                console.log(req.body);
                tournamentController.updatePlayer(req.body.tournamentidform, req.body.playerid, req.body.playername, function(err) {
                    if (err) {
                        res.status(500).send({err : err, msg : "Something went wrong"});
                    } else {
                        res.status(200).send({err : null, msg : "Successfully updated player"});
                    }
                });
            }
        });

    app.route("/home/tournaments/players/create")
        .post(function(req, res, next) {
            console.log(req.body);
            if (!req.session.director) {
                res.status(401).send({msg : "Hmm, doesn't seem like you're logged in. "});
            } else {
                tournamentController.addPlayer(req.body.tournamentidform, req.body.teamnameform, req.body.teamidform, req.body.newplayername, function(err, player) {
                    if (err) {
                        console.log("Error");
                        res.status(500).send({err : err, player : null, msg : "Something went wrong", tid : null});
                    } else {
                        console.log("Added player");
                        res.status(200).send({err : null, player : player, msg : "Successfully added player", tid : req.body.tournamentidform});
                    }
                });
            }
        });

    app.route("/home/tournaments/create/submit")
        .post(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                var name = req.body.t_name;
                var location = req.body.t_location;
                var description = req.body.t_description;
                var date = req.body.t_date;
                var questionset = req.body.t_qset;
                console.log("Session email: " + req.session.director.email);
                tournamentController.addTournament(req.session.director.email, name, date, location, description, questionset, function(err) {
                    if (err) {
                        res.redirect("/");
                    } else {
                        res.redirect("/home/tournaments");
                    }
                });
            }
        });

    app.route("/home/tournaments/getplayers")
        .get(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                var id = req.query["tournamentid"];
                var teamname = req.query["teamname"];
                tournamentController.findTeamMembers(id, teamname, function(err, players, pointScheme) {
                    if (err) {
                        // DO STUFF
                        console.log(err);
                        res.status(500).send({players : [], pointScheme : null});
                    } else {
                        res.status(200).send({players : players, pointScheme : pointScheme});
                    }
                });
            }
        });

    app.get("/home/tournaments/:tid/teams/:teamid", function(req, res) {
        // Add check for session here
        console.log(req.params);
        tournamentController.findTournamentById(req.params.tid, function(err, result) {
            var team = null;
            if (result) {
                for (var i = 0; i < result.teams.length; i++) {
                    if (result.teams[i].shortID == req.params.teamid) {
                        team = result.teams[i];
                        i = result.teams.length + 1;
                    }
                }
                if (team !== null) {
                    var teamPlayers = [];
                    for (var i = 0; i < result.players.length; i++) {
                        if (result.players[i].teamID == team._id) {
                            teamPlayers.push(result.players[i]);
                        }
                    }
                    res.render("team-view", {team : team, teamPlayers : teamPlayers, tournament : result, tournamentd : req.session.director});
                } else {
                    res.status(404).send("Couldn't find that page");
                }
            } else {
                res.status(404).send("Couldn't find that tournament");
            }
        });
    });

    app.get("/home/tournaments/:tid/games/:gid", function(req, res) {
        // console.log(req.params);
        if (!req.session.director) {
            return res.redirect("/");
        }
        tournamentController.findTournamentById(req.params.tid, function(err, result) {
            var game = null;
            if (result) {
                for (var i = 0; i < result.games.length; i++) {
                    if (result.games[i].shortID == req.params.gid) {
                        game = result.games[i];
                        i = result.games.length + 1;
                    }
                }
                if (game !== null) {
                    // console.log(result.players);
                    var team1Players = [];
                    var team2Players = [];
                    for (var i = 0; i < result.players.length; i++) {
                        // console.log(game.team1.team_id + " | " + result.players[i].teamID);
                        if (result.players[i].teamID == game.team1.team_id) {
                            team1Players.push(result.players[i]);
                        } else if (result.players[i].teamID == game.team2.team_id) {
                            team2Players.push(result.players[i]);
                        }
                    }
                    res.render("game-view", {tournamentd : req.session.director, game : game, tournamentName : result.tournament_name,
                        team1Players : team1Players, team2Players : team2Players, tournament : result});
                } else {
                    res.status(404).send("Couldn't find that specific page");
                }
            }
        });
    });

    app.get("/home/tournaments/:tid", function(req, res, next) {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            tournamentController.findTournamentById(req.params.tid, function(err, result) {
                if (err || result == null) {
                    //DO STUFF
                    res.status(200).send("Couldn't find anything");
                } else {
                    res.render("tournament-view", {tournament : result, tournamentd : req.session.director});
                }
            });
        }
    });

    app.get("/home/tournaments", function(req, res, next) {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            tournamentController.findTournamentsByDirector(req.session.director.email, function(err, result) {
                console.log(result);
                if (err || result == null) {
                    // DO STUFF
                    console.log("Result is null");
                    res.render("alltournaments", {tournaments : [], tournamentd : req.session.director});
                } else {
                    res.render("alltournaments", {tournaments : result, tournamentd : req.session.director});
                }
            });
        }
    });

    app.get("*", function(req, res, next) {
        res.status(404).send("Can't find this page");
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
