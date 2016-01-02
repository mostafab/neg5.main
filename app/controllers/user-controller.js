'use strict';

var mongoose = require("mongoose");
var bcryptjs = require("bcryptjs");

var User = mongoose.model("User");
var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var tournamentController = require('../../app/controllers/tournament-controller');

/**
* Validates a login given a username and password
* @param credentials username and password
* @param callback callback with an error (or null) and indication of login
*/
function validateLocalLogin(credentials, callback) {
    User.findOne({"local.email" : credentials["usrname"].toLowerCase()}, function(err, result) {
        if (err) {
            console.log(err);
            callback(err, "", null);
        } else if (result == null) {
            callback(null, "NONE", "");
        } else {
            bcryptjs.compare(credentials["pswd"], result.local.password, function(err, res) {
                if (res) {
                    TournamentDirector.findOne({usertoken : result._id}, function(err, result) {
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

/**
* Registers a user
* @param credentials username and password
* @param callback callback with error (or null) and indication of whether or not
* registration was successful
*/
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

/**
* Makes a user and tournament director
* @param req username, password, and name
* @param callback
*/
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
                    // console.log(user);
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
                                        email : email,
                                        usertoken : user._id
                                    });
                                    // console.log(td);
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

/**
* Updates a user's email and name. First checks if another user who is NOT the same user
* already has this email. If no one does, proceed as normal and change user's email and name and
* propapage changes to the TournamentDirector collection.
*/
function updateEmailAndName(director, newName, newEmail, callback) {
    TournamentDirector.findOne({email : newEmail, _id : {$ne : director._id}}, function(err, result) {
        // console.log(result);
        if (err) {
            console.log(err);
            callback(err, null, false);
        } else if (result) {
            callback(null, null, true);
        } else {
            User.update({_id : director.usertoken}, {"local.name" : newName, "local.email" : newEmail}, function(err) {
                if (err) {
                    callback(err, null, false);
                } else {
                    TournamentDirector.update({_id : director._id}, {name : newName, email : newEmail}, function(err) {
                        if (err) {
                            callback(err, null, false);
                        } else {
                            TournamentDirector.findOne({_id : director._id}, function(err, result) {
                                if (err) {
                                    callback(err, null, false);
                                } else {
                                    callback(null, result, false);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

/**
* Updates a user's password if credentials match
* @param director director to update
* @param oldPassword old password to check
* @param newPassword new password to check
* @param callback callback with an error (or null) and a boolean indicating
* success or failure
*/
function updateUserPassword(director, oldPassword, newPassword, callback) {
    // console.log(oldPassword);
    User.findOne({_id : director.usertoken}, function(err, result) {
        // console.log(result);
        if (err) {
            callback(err, false);
        } else if (result) {
            bcryptjs.compare(oldPassword, result.local.password, function(err, res) {
                if (err) {
                    callback(err, false);
                } else if (!res) {
                    callback(null, true);
                } else {
                    bcryptjs.genSalt(10, function(err, salt) {
                        if (err) {
                            callback(err, false);
                        } else {
                            bcryptjs.hash(newPassword, salt, function(err, hash) {
                                if (err) {
                                    callback(err, false);
                                } else {
                                    // console.log(hash);
                                    User.update({_id : director.usertoken}, {"local.password" : hash}, function(err) {
                                        if (err) {
                                            callback(err, false);
                                        } else {
                                            callback(null, false);
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
exports.updateEmailAndName = updateEmailAndName;
exports.updateUserPassword = updateUserPassword;
