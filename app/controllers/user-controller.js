var User = require("mongoose").model("User");
var Tournament = require("mongoose").model("Tournament");
var mongoose = require("mongoose");

exports.create = function(req, res, next) {
    var name = req.body["r_name"];
    var email = req.body["r_usrname"];
    var password = req.body["r_pswd"];
    var t = new Tournament({
        name : "BISB",
        location : "Atlanta"
    });
    var user = new User({
            name : name,
            email : email,
            password : password,
        });
    user.tournaments.push(t);
    console.log(user);
    user.save(function(err) {
        if (err) {
            return next(err);
        } else {
            res.render("index", {title : "Thanks for Registering, " + name + "!",
                                message : "Login to Continue."
            });
        }

    });

};

exports.login = function(req, res, next) {

}
