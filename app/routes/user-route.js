var userController = require('../../app/controllers/user-controller');

module.exports = function(app) {
    app.route('/register')
        .post(function(req, res, next) {
            userController.register(req.body, function(err, message) {
                if (err) {
                    res.send("The registration process isn't working right now.");
                } else if (message === "EXISTS") {
                    res.send("A user with that email already exists.");
                } else {
                    res.send("You're good to go! You can login now. ");
                }
            });
        });

    app.route("/home")
        .post(function(req, res, next) {
                userController.validateLogin(req.body, function(err, valid, director) {
                    if (err) {
                        // res.status(500).send("The validation process isn't working right now");
                        res.status(500).render("index", {title : "Neg 5",
                                                        message : "Quizbowl for the Cloud",
                                                        errormsg : "The validation process isn't working right now."});
                    } else if (valid === "NONE") {
                        console.log("No one by that name");
                        // res.send("There's no one registered under that email");
                        res.status(200).render("index", {title : "Neg 5",
                                                        message : "Quizbowl for the Cloud",
                                                        errormsg : "There's no one registered under that email."});
                    } else if (valid === "INVALID") {
                        // res.send("Invalid credentials. Please try again.");
                        res.status(200).render("index", {title : "Neg 5",
                                                        message : "Quizbowl for the Cloud",
                                                        errormsg : "Invalid credentials. Please try again."});
                    } else {
                        req.session.director = director;
                        res.render("home", {tournamentd : director});
                        console.log(req.session.director);
                    }
                });
        })
        .get(function(req, res, next) {
            if (!req.session.director) {
                res.redirect("/");
            } else {
                res.render("home", {tournamentd : req.session.director});
            }
        });

    app.route("/logout")
        .get(function(req, res, next) {
            req.session.reset();
            res.redirect("/");
        });
};
