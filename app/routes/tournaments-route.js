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
                tournamentController.addTournament(req.session.director.email, name, date, location, description, questionset);
                res.redirect("/home/tournaments");
            }
        })
        .get(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                res.redirect("/home/tournaments/create");
            }
        })

    app.route("/home/tournaments")
        .get(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                if (checkEmptyQuery(req.query)) {
                    tournamentController.findTournamentsByDirector(req.session.director.email, function(err, result) {
                        if (err || result == null) {
                            // DO STUFF
                            console.log("Result is null");
                            res.render("alltournaments", {tournaments : [], tournamentd : req.session.director});
                        } else {
                            res.render("alltournaments", {tournaments : result, tournamentd : req.session.director});
                        }
                    });
                } else {
                    tournamentController.findTournamentById(req.query._id, function(err, result) {
                        if (err || result == null) {
                            //DO STUFF
                        } else {
                            res.render("tournament-view", {tournament : result, tournamentd : req.session.director});
                        }
                    });
                }
            }
        });

    app.route("/home/tournaments/createteam")
        .post(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                var id = req.body["tournament_id"];
                console.log(req.body);
                tournamentController.addTeamToTournament(id, req.body, function(err, teams) {
                    if (err) {
                        // DO STUFF
                    } else {
                        res.send(teams);
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
                        res.status(500).send([]);
                    } else {
                        res.status(200).send(games);
                    }
                });
            }  
        });

    // app.route("/home/tournaments/createplayers")
    //     .post(function(req, res, next) {
    //         var id = req.body["tournament_id_player"];
    //         tournamentController.addPlayersToTournament(id, req.body, function(err) {
    //             console.log("Callback");
    //             if (err) {
    //                 // DO STUFF
    //             } else {
    //                 res.end();
    //             }
    //         });
    //     });

    app.route("/home/tournaments/getplayers")
        .get(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                var id = req.query["tournamentid"];
                var teamname = req.query["teamname"];
                tournamentController.findTeamMembers(id, teamname, function(err, result) {
                    if (err) {
                        // DO STUFF
                        // console.log(err.stack);
                        res.status(500).send("Shiiiiiit");
                    } else {
                        res.status(200).send(result);
                    }
                });
            }
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
