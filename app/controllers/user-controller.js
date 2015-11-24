var mongoose = require("mongoose");
var bcryptjs = require("bcryptjs");

var User = mongoose.model("User");
var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var tournamentController = require('../../app/controllers/tournament-controller');

function validateLogin(credentials, callback) {
    console.log("Credentials: " + credentials["usrname"].toLowerCase());
    var testUser = new User({
        email : credentials["usrname"],
        password : credentials["pswd"]
    });
    User.findOne({email : credentials["usrname"].toLowerCase()}, function(err, result) {
        // console.log("RESULT: " + result);
        if (err) {
            console.log(err);
            callback(err, "", "");
        } else if (result == null) {
            // console.log("RESULT IS NULL");
            callback(null, "NONE", "");
        } else {
            bcryptjs.compare(credentials["pswd"], result.password, function(err, res) {
                if (res) {
                    TournamentDirector.findOne({email : credentials["usrname"]}, function(err, result) {
                        if (err || result == null) {
                            callback(null, "NONE", "");
                        } else {
                            callback(null, "OK", result);
                        }
                    });
                } else {
                    callback(null, "INVALID", "");
                }
            });
        }
    });
}

function register(credentials, callback) {
    console.log(credentials);
    User.findOne({email : credentials["r_usrname"].toLowerCase()}, function(err, result) {
        if (err) {
            callback(err, "");
        } else if (result) {
            callback(null, "EXISTS");
        } else {
            console.log("Got here");
            makeUser(credentials, function(err) {
                if (err) {
                    callback(err, "");
                } else {
                    callback(null, "OK");
                }
            });
        }
    });
}

function makeUser(req, callback) {
    var name = req["r_name"];
    var email = req["r_usrname"].toLowerCase();
    var password = req["r_pswd"];
    bcryptjs.genSalt(10, function(err, salt) {
        if (err) {
            console.log("Error: " + err);
            return false;
        } else {
            bcryptjs.hash(password, salt, function(err, hash) {
                if (err) {
                    callback(err);
                } else {
                    var user = new User({
                            name : name,
                            email : email,
                            password : hash,
                    });
                    console.log(user);
                    user.save(function(err) {
                        if (err) {
                            callback(err);
                        } else {
                            var td = new TournamentDirector({
                                name : name,
                                email : email
                            });
                            td.save(function(err) {
                                if (err) {
                                    callback(err);
                                } else {
                                    callback(null);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

exports.validateLogin = validateLogin;
exports.register = register;
