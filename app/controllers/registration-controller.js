var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var Registration = mongoose.model("Registration");

function createRegistration(tournamentid, directorid, information, callback) {
    var reg = new Registration({
        teamName : information.team_name,
        numTeams : information.teamnumber,
        email : information.email,
        message : information.otherinfo,
        tournamentid : tournamentid,
        directorid : directorid
    });
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        // console.log(result.tournament_name);
        if (err || result == null) {
            callback(err, null);
        } else if (!result.openRegistration) {
            // console.log()
            callback(null, "CLOSED");
        } else {
            if (reg.directorid == null) {
                TournamentDirector.findOne({email : information.email.toLowerCase()}, function(err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        // console.log(result);
                        if (result) {
                            reg.directorid = result._id;
                        }
                        // console.log(reg);
                        if (reg.directorid == null) {
                            var query = {tournamentid : reg.tournamentid, email : reg.email};
                            var update = {teamName : reg.teamName, numTeams : reg.numTeams, email : reg.email,
                                message : reg.message, tournamentid : reg.tournamentid, directorid : reg.directorid, signupTime : Date.now()};
                            var options = {upsert : true};
                            Registration.update(query, update, options, function(err) {
                                callback(err, null);
                            });
                            // reg.save(function(err) {
                            //     callback(err);
                            // });
                        } else {
                            var query = {tournamentid : reg.tournamentid, directorid : reg.directorid};
                            var update = {teamName : reg.teamName, numTeams : reg.numTeams, email : reg.email,
                                message : reg.message, tournamentid : reg.tournamentid, directorid : reg.directorid, signupTime : Date.now()};
                            var options = {upsert : true};
                            Registration.update(query, update, options, function(err) {
                                callback(err, null);
                            });
                        }
                    }
                });
            } else {
                // console.log(reg);
                var query = {tournamentid : reg.tournamentid, directorid : reg.directorid};
                var update = {teamName : reg.teamName, numTeams : reg.numTeams, email : reg.email,
                    message : reg.message, tournamentid : reg.tournamentid, directorid : reg.directorid, signupTime : Date.now()};
                var options = {upsert : true};
                Registration.update(query, update, options, function(err) {
                    callback(err, null);
                });
            }
        }
    });
}

function findRegistrationsByTournament(tournamentid, callback) {
    Registration.find({tournamentid : tournamentid}, function(err, registrations) {
        if (err) {
            callback(err, []);
        } else {
            registrations.sort(function(first, second) {
                return second.signupTime - first.signupTime;
            });
            callback(null, registrations);
        }
    });
}

exports.createRegistration = createRegistration;
exports.findRegistrationsByTournament = findRegistrationsByTournament;
