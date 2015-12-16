var signupController = require('../../app/controllers/signup-controller');
var tournamentController = require("../../app/controllers/tournament-controller");

module.exports = function(app) {

    app.get("/:tid/signup", function(req, res) {
        tournamentController.findTournamentById(req.params.tid, function(err, result) {
            if (err) {
                res.send(err);
            } else {
                res.render("signup", {tournament : result, director : req.session.director});
            }
        });
    });
};
