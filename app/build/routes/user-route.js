'use strict';

var _account = require('../models/sql-models/account');

var _account2 = _interopRequireDefault(_account);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userController = require('../controllers/user-controller');

module.exports = function (app) {

    app.get("/account", function (req, res, next) {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            res.render("index/account", { tournamentd: req.session.director });
        }
    });

    app.post("/register/local", function (req, res, next) {
        // userController.register(req.body, (err, message) => {
        //     if (err) {
        //         return res.status(500).send({err : err});
        //     } else if (message === "EXISTS") {
        //         return res.send({msg : "A user with that email already exists.", exists : true});
        //     } else {
        //         return res.send({msg : "You're good to go! You can login now."});
        //     }
        // });
        var _req$body = req.body;
        var r_usrname = _req$body.r_usrname;
        var r_pswd = _req$body.r_pswd;

        _account2.default.createAccount(r_usrname, r_pswd).then(function (user) {
            return res.json({ user: user });
        }).catch(function (error) {
            console.log(error);
            return res.status(500).send(error);
        });
    });

    app.post("/auth/local", function (req, res, next) {
        userController.validateLocalLogin(req.body, function (err, valid, user) {
            if (err) {
                res.status(500).render("index", { title: "Neg 5",
                    message: "Quizbowl for the Cloud",
                    errormsg: "The validation process isn't working right now." });
            } else if (valid === "NONE") {
                res.status(200).render("index", { title: "Neg 5",
                    message: "Quizbowl for the Cloud",
                    errormsg: "There's no one registered under that email." });
            } else if (valid === "INVALID") {
                res.status(200).render("index", { title: "Neg 5",
                    message: "Quizbowl for the Cloud",
                    errormsg: "Invalid credentials. Please try again." });
            } else {
                req.session.director = user;
                if (req.session.lastURL) {
                    var lastURL = req.session.lastURL;
                    req.session.lastURL = null;
                    res.redirect(lastURL);
                } else {
                    res.redirect("/home");
                }
            }
        });
    });

    app.get("/auth/local", function (req, res, next) {
        res.redirect("/");
    });

    app.post("/auth/local/edit", function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            userController.updateEmailAndName(req.session.director, req.body.dname, req.body.demail.toLowerCase(), req.body.dvisible, function (err, newDirector, duplicate) {
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

    app.post("/auth/local/pass", function (req, res, next) {
        if (!req.session.director) {
            res.status(401).end();
        } else {
            userController.updateUserPassword(req.session.director, req.body.oldpass, req.body.newpass, function (err, wrong) {
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

    app.get("/home", function (req, res, next) {
        if (!req.session.director) {
            res.redirect("/");
        } else {
            res.redirect("/tournaments");
        }
    });

    app.route("/logout").get(function (req, res, next) {
        req.session.reset();
        res.redirect("/");
    });
};