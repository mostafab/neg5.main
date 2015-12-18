var mongoose = require("mongoose");
var bcryptjs = require("bcryptjs");

var User = mongoose.model("User");
var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var tournamentController = require('../../app/controllers/tournament-controller');

function validateLocalLogin(credentials, callback) {
    // console.log("Credentials: " + credentials["usrname"].toLowerCase());
    User.findOne({"local.email" : credentials["usrname"].toLowerCase()}, function(err, result) {
        if (err) {
            console.log(err);
            callback(err, "", null);
        } else if (result == null) {
            callback(null, "NONE", "");
        } else {
            bcryptjs.compare(credentials["pswd"], result.local.password, function(err, res) {
                if (res) {
                    TournamentDirector.findOne({email : credentials["usrname"]}, function(err, result) {
                        if (err || result == null) {
                            callback(null, "NONE", null);
                        } else {
                            // console.log("Tournament director found");
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
    // console.log(credentials);
    User.findOne({"local.email" : credentials["r_usrname"]}, function(err, result) {
        if (err) {
            console.log(err);
            callback(err, "");
        } else if (result) {
            callback(null, "EXISTS");
        } else {
            // console.log("Got here");
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
            callback(err);
        } else {
            bcryptjs.hash(password, salt, function(err, hash) {
                if (err) {
                    callback(err);
                } else {
                    var user = new User();
                    user.local.name = name;
                    user.local.email = email;
                    user.local.password = hash;
                    console.log(user);
                    user.save(function(err) {
                        if (err) {
                            console.log(err);
                            callback(err);
                        } else {
                            // callback(null);
                            TournamentDirector.findOne({email : email}, function(err, result) {
                                if (err) {
                                    callback(err);
                                } else if (result) {
                                    callback(null);
                                } else {
                                    var td = new TournamentDirector({
                                        name : name,
                                        email : email
                                    });
                                    td.save(function(err) {
                                        if (err) {
                                            console.log(err);
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
    });
}

exports.validateLocalLogin = validateLocalLogin;
exports.register = register;
