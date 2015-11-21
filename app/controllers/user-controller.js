var mongoose = require("mongoose");

var User = mongoose.model("User");
var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var tournamentController = require('../../app/controllers/tournament-controller');

function validateLogin(credentials, callback) {
    console.log("Credentials: " + credentials["usrname"]);
    User.findOne({email : credentials["usrname"]}, function(err, result) {
        // console.log("RESULT: " + result);
        if (err) {
            console.log(err);
            callback(err, "", "");
        } else if (result == null) {
            // console.log("RESULT IS NULL");
            callback(null, "NONE", "");
        } else if (result.password !== credentials["pswd"]) {
            callback(null, "INVALID", "");
        } else {
            TournamentDirector.findOne({email : credentials["usrname"]}, function(err, director) {
                if (err) {
                    callback(err, "", "");
                } else {
                    callback(null, "OK", director);
                }
            });
        }
    });
}

function register(credentials, callback) {
    console.log(credentials);
    User.findOne({email : credentials["r_usrname"]}, function(err, result) {
        if (err) {
            callback(err, "");
        } else if (result) {
            callback(null, "EXISTS");
        } else {
            var user = makeUser(credentials);
            var td = makeDirector(credentials);
            user.save(function(err) {
                if (err) {
                    callback(err, "");
                } else {
                    td.save(function(err) {
                        if (err) {
                            callback(err, "");
                        } else {
                            callback(null, "OK");
                        }
                    });
                }
            });
        }
    });
}

//
// exports.create = function(req, res, next) {
//     var name = req.body["r_name"];
//     var email = req.body["r_usrname"];
//     var password = req.body["r_pswd"];
//     var user = makeUser(req);
//     var td = makeDirector(req);
//     user.save(function(err) {
//         if (err) {
//             res.status(500).send();
//         } else {
//             td.save(function(err) {
//                 if (err) {
//                     res.status(500).send();
//                 }
//             });
//             res.status(200).send();
//         }
//     });
// };
//
// exports.login = function(req, res, next) {
//     res.render("home", {title : "You've Logged in!",
//                         message : "Login to Continue."
//             });
// };

function makeUser(req) {
    var name = req["r_name"];
    var email = req["r_usrname"];
    var password = req["r_pswd"];
    var user = new User({
            name : name,
            email : email,
            password : password,
    });
    return user;
}

function makeDirector(req) {
    var name = req["r_name"];
    var email = req["r_usrname"];
    var td = new TournamentDirector({
        name : name,
        email : email,
    });
    return td;
}

exports.validateLogin = validateLogin;
exports.register = register;
