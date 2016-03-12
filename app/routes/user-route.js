'use strict';

const userController = require('../../app/controllers/user-controller');

module.exports = app => {

    app.get("/account", (req, res, next) => {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            res.render("account", {tournamentd : req.session.director});
        }
    });

    app.post("/register/local", (req, res, next) => {
        userController.register(req.body, (err, message) => {
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
        userController.validateLocalLogin(req.body, (err, valid, user) => {
            if (err) {
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
                if (req.session.lastURL) {
                    const lastURL = req.session.lastURL;
                    req.session.lastURL = null;
                    res.redirect(lastURL);
                } else {
                    res.redirect("/home");
                }
            }
        });
    });

    app.get("/auth/local", (req, res, next) => {
        res.redirect("/");
    });

    app.post("/auth/local/edit", (req, res, next) => {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            userController.updateEmailAndName(req.session.director, req.body.dname, req.body.demail.toLowerCase(), req.body.dvisible, (err, newDirector, duplicate) => {
                if (err) {
                    res.status(500).end();
                } else if (duplicate) {
                    res.status(403).end();
                } else {
                    req.session.director = newDirector;
                    res.status(200).end();
                }
            });
        }
    });

    app.post("/auth/local/pass", (req, res, next) => {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            userController.updateUserPassword(req.session.director, req.body.oldpass, req.body.newpass, (err, wrong) => {
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
        if (!req.session.director) {
            res.redirect("/");
        } else {
            res.redirect("/tournaments");
        }
    });

    app.route("/logout")
        .get((req, res, next) => {
            req.session.reset();
            res.redirect("/");
        });
};
