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
            tournamentController.findTournamentsByDirector("test@domain.com", function(err, result) {
                if (err) {
                    // DO STUFF
                } else {
                    res.render("alltournaments", {tournaments : result});
                }
            });
        });

    app.route("/home/tournaments/:id")
        .get(function(req, res, next) {
            console.log("Request: " + req.query._id);
        });
};
