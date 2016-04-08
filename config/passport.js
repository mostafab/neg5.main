const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const configAuth = require("./auth");

const User = require("../app/models/user");
const TournamentDirector = require("../app/models/tournament-director");

module.exports = function(passport) {

    passport.serializeUser((director, done) => {
        done(null, director._id);
    });

    passport.deserializeUser((id, done) => {
        TournamentDirector.findById(id, (err, user) => {
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({
        clientID : configAuth.googleAuth.clientID,
        clientSecret : configAuth.googleAuth.clientSecret,
        callbackURL : configAuth.googleAuth.callbackURLLocal
    }, (token, refreshToken, profile, done) => {
        process.nextTick(function() {
            User.findOne({ $or : [{"google.id" : profile.id}, {"local.email" : profile.emails[0].value}]}, (err, user) => {
                if (err) {
                    return done(err);
                } else if (user) {
                    TournamentDirector.findOne({ usertoken : user._id}, (err, director) => {
                        return done(null, director);
                    });
                } else {
                    const newUser = new User();
                    newUser.google.id = profile.id;
                    newUser.google.token = token;
                    newUser.google.name = profile.displayName;
                    newUser.google.email = profile.emails[0].value;
                    newUser.save(err => {
                        if (err) {
                            return done(err);
                        } else {
                            TournamentDirector.findOne({email : profile.emails[0].value}, (err, director) => {
                                if (err) {
                                    return done(err);
                                } else if (director) {
                                    return done(null, director);
                                } else {
                                    const td = new TournamentDirector();
                                    td.name = profile.displayName;
                                    td.email = profile.emails[0].value;
                                    td.usertoken = newUser._id;
                                    td.save(err => {
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
