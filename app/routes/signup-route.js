var signupController = require('../../app/controllers/registration-controller');
var tournamentController = require("../../app/controllers/tournament-controller");

module.exports = function(app) {

    app.get("/:tid/signup", function(req, res) {
        tournamentController.findTournamentById(req.params.tid, function(err, result) {
            if (err) {
                res.send(err);
            } else {
                res.render("signup", {tournament : result, tournamentd : req.session.director});
            }
        });
    });

    app.post("/:tid/signup/submit", function(req, res) {
        var directorid = req.session.director == null ? null : req.session.director._id;
        var tournamentid = req.params.tid;
        signupController.createRegistration(tournamentid, directorid, req.body, function(err, closed) {
            if (err) {
                res.status(500).send({err : err});
            } else {
                res.status(200).send({err : null, closed : closed});
            }
        });
    });
};
