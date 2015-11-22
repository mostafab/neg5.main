var mongoose = require("mongoose");

var User = mongoose.model("User");
var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var tournamentController = require('../../app/controllers/tournament-controller');
var crypto = require("./crypto");

function validateLogin(credentials, callback) {
    console.log("Credentials: " + credentials["usrname"].toLowerCase());
    User.findOne({email : credentials["usrname"].toLowerCase()}, function(err, result) {
        // console.log("RESULT: " + result);
        if (err) {
            console.log(err);
            callback(err, "", "");
        } else if (result == null) {
            // console.log("RESULT IS NULL");
            callback(null, "NONE", "");
        } else if (result.password !== crypto.encrypt(credentials["pswd"])) {
            callback(null, "INVALID", "");
        } else {
            TournamentDirector.findOne({email : credentials["usrname"].toLowerCase()}, function(err, director) {
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

function makeUser(req) {
    var name = req["r_name"];
    var email = req["r_usrname"].toLowerCase();
    var password = crypto.encrypt(req["r_pswd"]);
    var user = new User({
            name : name,
            email : email,
            password : password,
    });
    return user;
}

function makeDirector(req) {
    var name = req["r_name"];
    var email = req["r_usrname"].toLowerCase();
    var td = new TournamentDirector({
        name : name,
        email : email,
    });
    return td;
}

exports.validateLogin = validateLogin;
exports.register = register;
