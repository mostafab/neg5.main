var mongoose = require("mongoose");

var User = mongoose.model("User");
var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var tournamentController = require('../../app/controllers/tournament-controller');


exports.create = function(req, res, next) {
    var name = req.body["r_name"];
    var email = req.body["r_usrname"];
    var password = req.body["r_pswd"];
    var user = makeUser(req);
    var td = makeDirector(req);
    user.save(function(err) {
        if (err) {
            res.status(500).send();
        } else {
            td.save(function(err) {
                if (err) {
                    res.status(500).send();
                }
            });
            res.status(200).send();
        }
    });
};

exports.login = function(req, res, next) {
    res.render("home", {title : "You've Logged in!",
                        message : "Login to Continue."
            });
};

function makeUser(req) {
    var name = req.body["r_name"];
    var email = req.body["r_usrname"];
    var password = req.body["r_pswd"];
    var user = new User({
            name : name,
            email : email,
            password : password,
    });
    return user;
}

function makeDirector(req) {
    var name = req.body["r_name"];
    var email = req.body["r_usrname"];
    var td = new TournamentDirector({
        name : name,
        email : email,
    });
    return td;
}
