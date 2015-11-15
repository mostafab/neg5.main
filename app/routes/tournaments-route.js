var tournamentController = require('../../app/controllers/tournament-controller');

module.exports = function(app) {

    app.route('/home/tournaments/create')
        .get(function(req, res, next) {
            res.render("create");
        });

    app.route("/home/tournaments/create/submit")
        .post(function(req, res, next) {
            var name = req.body.t_name;
            var location = req.body.t_location;
            var description = req.body.t_description;
            var date = req.body.t_date;
            var questionset = req.body.t_qset;
            tournamentController.addTournament("test@domain.com", name, date, location, description, questionset);
            res.redirect("/home");
        });

    app.route("/home/tournaments")
        .get(function(req, res, next) {
            if (checkEmptyQuery(req.query)) {
                tournamentController.findTournamentsByDirector("test@domain.com", function(err, result) {
                    if (err) {
                        // DO STUFF
                    } else {
                        res.render("alltournaments", {tournaments : result});
                    }
                });
            } else {
                tournamentController.findTournamentById(req.query._id, function(err, result) {
                    if (err || result == null) {
                        //DO STUFF
                    } else {
                        res.render("tournament-view", {tournament : result});
                    }
                });
            }
        });

    app.route("/home/tournaments/createteam")
        .post(function(req, res, next) {
            var id = req.body["tournament_id"];
            tournamentController.addTeamToTournament(id, req.body, function(err) {
                if (err) {
                    // DO STUFF
                } else {
                    res.status(200);
                }
            });
        });

    app.route("/home/tournaments/createplayers")
        .post(function(req, res, next) {
            var id = req.body["tournament_id_player"];
            tournamentController.addPlayersToTournament(id, req.body, function(err) {
                if (err) {
                    // DO STUFF
                } else {
                    res.status(200);
                }
            });
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
