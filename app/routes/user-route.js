const userController = require('../../app/controllers/user-controller');

module.exports = function(app) {

    app.get("/account", (req, res, next) => {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            res.render("account", {tournamentd : req.session.director});
        }
    });

    // app.get("/auth/google", passport.authenticate("google", {scope : ["profile", "email"]}));

    // app.get("/auth/google/callback", (req, res, next) => {
    //     passport.authenticate("google", function(err, director) {
    //         if (err) {
    //             res.redirect("/");
    //         } else if (!director) {
    //             res.redirect("/");
    //         } else {
    //             req.session.director = director;
    //             res.redirect("/home");
    //         }
    //     })(req, res, next);
    // });

    app.post("/register/local", (req, res, next) => {
        userController.register(req.body, function(err, message) {
            if (err) {
                return res.status(500).send({err : err});
            } else if (message === "EXISTS") {
                return res.send({msg : "A user with that email already exists.", exists : true});
            } else {
                return res.send({msg : "You're good to go! You can login now."});
            }
        });
    });

    app.post("/auth/local", (req, res, next) => {
        userController.validateLocalLogin(req.body, function(err, valid, user) {
            if (err) {
                // res.status(500).send("The validation process isn't working right now");
                res.status(500).render("index", {title : "Neg 5",
                                                message : "Quizbowl for the Cloud",
                                                errormsg : "The validation process isn't working right now."});
            } else if (valid === "NONE") {
                res.status(200).render("index", {title : "Neg 5",
                                                message : "Quizbowl for the Cloud",
                                                errormsg : "There's no one registered under that email."});
            } else if (valid === "INVALID") {
                res.status(200).render("index", {title : "Neg 5",
                                                message : "Quizbowl for the Cloud",
                                                errormsg : "Invalid credentials. Please try again."});
            } else {
                req.session.director = user;
                res.redirect("/home");
            }
        });
    });

    app.get("/auth/local", (req, res, next) => {
        res.redirect("/");
    });

    app.post("/auth/local/edit", (req, res, next) => {
        // console.log(req.body);
        if (!req.session.director) {
            res.status(401).end();
        } else {
            userController.updateEmailAndName(req.session.director, req.body.dname, req.body.demail.toLowerCase(), function(err, newDirector, duplicate) {
                if (err) {
                    res.status(500).end();
                } else if (duplicate) {
                    res.status(403).end();
                } else {
                    req.session.director = newDirector;
                    // console.log(req.session.director);
                    res.status(200).end();
                }
            });
        }
    });

    app.post("/auth/local/pass", (req, res, next) => {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            // console.log(req.body);
            userController.updateUserPassword(req.session.director, req.body.oldpass, req.body.newpass, function(err, wrong) {
                if (err) {
                    res.status(500).end();
                } else if (wrong) {
                    res.status(403).end();
                } else {
                    res.status(200).end();
                }
            });
        }
    });

    app.get("/home", (req, res, next) => {
        // console.log(req.session);
        if (!req.session.director) {
            res.redirect("/");
        } else {
            // console.log("About to render home page...");
            // res.render("home", {tournamentd : req.session.director});
            res.redirect("/tournaments");
        }
    });

    app.route("/logout")
        .get((req, res, next) => {
            req.session.reset();
            // req.logout();
            res.redirect("/");
        });
};
