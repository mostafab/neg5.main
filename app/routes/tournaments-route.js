var tournamentController = require('../../app/controllers/tournament-controller');

module.exports = function(app) {
    app.route('/home/tournaments/create')
        .post(function(req, res, next) {
            var name = req.body.t_name;
            var location = req.body.t_location;
            var description = req.body.t_description;
            var date = req.body.t_date;
            tournamentController.addTournament(null, name, date, location, description);
            res.redirect("/home");
        });
};
