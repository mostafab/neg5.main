'use strict';

const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const User = mongoose.model("User");
const Tournament = mongoose.model("Tournament");
const TournamentDirector = mongoose.model("TournamentDirector");
const tournamentController = require('../../app/controllers/tournament-controller');

/**
* Validates a login given a username and password
* @param credentials username and password
* @param callback callback with an error (or null) and indication of login
*/
function validateLocalLogin(credentials, callback) {
    User.findOne({"local.email" : credentials["usrname"].toLowerCase()}, (err, result) => {
        if (err) {
            console.log(err);
            callback(err, "", null);
        } else if (result == null) {
            callback(null, "NONE", "");
        } else {
            bcryptjs.compare(credentials["pswd"], result.local.password, (err, res) => {
                if (res) {
                    TournamentDirector.findOne({usertoken : result._id}, (err, director) => {
                        if (err) {
                            callback(err);
                        } else if (director) {
                            callback(null, "OK", director);
                        } else {
                            callback(null, "NONE", null);
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
    User.findOne({"local.email" : credentials["r_usrname"]}, (err, result) => {
        if (err) {
            console.log(err);
            callback(err);
        } else if (result) {
            callback(null, "EXISTS");
        } else {
            makeUser(credentials, err => {
                if (err) {
                    callback(err);
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
    bcryptjs.genSalt(10, (err, salt) => {
        if (err) {
            console.log("Error: " + err);
            callback(err);
        } else {
            bcryptjs.hash(password, salt, (err, hash) => {
                if (err) {
                    callback(err);
                } else {
                    var user = new User();
                    user.local.name = name;
                    user.local.email = email;
                    user.local.password = hash;
                    user.save(err => {
                        if (err) {
                            console.log(err);
                            callback(err);
                        } else {
                            TournamentDirector.findOne({email : email}, (err, result) => {
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
                                    td.save(err => {
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
    TournamentDirector.findOne({email : newEmail, _id : {$ne : director._id}}, (err, result) => {
        if (err) {
            console.log(err);
            callback(err);
        } else if (result) {
            callback(null, null, true);
        } else {
            User.update({_id : director.usertoken}, {"local.name" : newName, "local.email" : newEmail}, err => {
                if (err) {
                    callback(err, null, false);
                } else {
                    TournamentDirector.update({_id : director._id}, {name : newName, email : newEmail}, err => {
                        if (err) {
                            callback(err, null, false);
                        } else {
                            TournamentDirector.findOne({_id : director._id}, (err, result) => {
                                if (err) {
                                    callback(err);
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
    User.findOne({_id : director.usertoken}, function(err, result) {
        if (err) {
            callback(err, false);
        } else if (result) {
            bcryptjs.compare(oldPassword, result.local.password, (err, res) => {
                if (err) {
                    callback(err, false);
                } else if (!res) {
                    callback(null, true);
                } else {
                    bcryptjs.genSalt(10, (err, salt) => {
                        if (err) {
                            callback(err, false);
                        } else {
                            bcryptjs.hash(newPassword, salt, (err, hash) => {
                                if (err) {
                                    callback(err);
                                } else {
                                    User.update({_id : director.usertoken}, {"local.password" : hash}, err => {
                                        if (err) {
                                            callback(err);
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
