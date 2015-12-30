'use strict';

var LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var configAuth = require("./auth");

var User = require("../app/models/user");
var TournamentDirector = require("../app/models/tournament-director");

module.exports = function(passport) {

    passport.serializeUser(function(director, done) {
        done(null, director._id);
    });

    passport.deserializeUser(function(id, done) {
        TournamentDirector.findById(id, function(err, user) {
            console.log(user);
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({
        clientID : configAuth.googleAuth.clientID,
        clientSecret : configAuth.googleAuth.clientSecret,
        callbackURL : configAuth.googleAuth.callbackURLLocal
    }, function(token, refreshToken, profile, done) {
        process.nextTick(function() {
            // console.log("Google method was called for some reason");
            User.findOne({ $or : [{"google.id" : profile.id}, {"local.email" : profile.emails[0].value}]}, function(err, user) {
                console.log(user);
                if (err) {
                    return done(err);
                } else if (user) {
                    TournamentDirector.findOne({ usertoken : user._id}, function(err, director) {
                        console.log(director);
                        return done(null, director);
                    });
                } else {
                    var newUser = new User();
                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.displayName;
                    newUser.google.email = profile.emails[0].value;
                    // newUser.local.email = profile.emails[0].value;
                    newUser.save(function(err) {
                        if (err) {
                            return done(err);
                        } else {
                            TournamentDirector.findOne({email : profile.emails[0].value}, function(err, director) {
                                if (err) {
                                    return done(err);
                                } else if (director) {
                                    return done(null, director);
                                } else {
                                    var td = new TournamentDirector();
                                    td.name = profile.displayName;
                                    td.email = profile.emails[0].value;
                                    td.usertoken = newUser._id;
                                    td.save(function(err) {
                                        if (err) {
                                            return done(err);
                                        } else {
                                            return done(null, td);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        })
    }));


}
