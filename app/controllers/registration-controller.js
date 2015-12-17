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
    if (reg.directorid == null) {
        TournamentDirector.findOne({email : information.email}, function(err, result) {
            if (err) {
                callback(err);
            } else {
                console.log(result);
                if (result) {
                    reg.directorid = result._id;
                }
                console.log(reg);
                reg.save(function(err) {
                    callback(err);
                });
            }
        });
    } else {
        console.log(reg);
        reg.save(function(err) {
            callback(null);
        });
    }
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
