var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var Registration = mongoose.model("Registration");

/**
* Function responsible for creating a registration and adding it to the
* registration collection given a tournamentid, directorid, and pertinent
* information. The callback is a function that is called after this
* function is done running. It calls back with an error (or null if no error)
* and a message if the tournament is closed for regisration.
* This function works by first creating a registration model and finding the
* tournament to register for. If the registree has already registered under the directorid,
* that old registration is updated. Otherise, a new one is created
* @param tournamentid shortID of the tournament to register for
* @param directorid id of director who is signing up
* @param information business information about the registration like teamName and email
* @param asynchronous callback function called after this function is done.
*/
function createRegistration(tournamentid, directorid, information, callback) {
    var reg = new Registration({
        teamName : information.team_name,
        numTeams : information.teamnumber,
        email : information.email,
        message : information.otherinfo,
        tournamentid : tournamentid,
        directorid : directorid
    });
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        // console.log(result.tournament_name);
        if (err || tournament == null) {
            callback(err, null);
        } else if (!tournament.openRegistration) {
            callback(null, "CLOSED");
        } else {
                // console.log(reg);
            if (reg.directorid == null) {
                reg.save(function(err) {
                    callback(err, null);
                });
            } else {
                var query = {tournamentid : reg.tournamentid, directorid : reg.directorid};
                var update = {teamName : reg.teamName, numTeams : reg.numTeams, email : reg.email,
                    message : reg.message, tournamentid : reg.tournamentid, directorid : reg.directorid, signupTime : Date.now(), tournamentName : tournament.tournament_name};
                var options = {upsert : true};
                Registration.update(query, update, options, function(err) {
                    callback(err, null);
                });
            }
        }
    });
}

/**
* Retrieves all registrations for a tournament. Callback with the list of
* all related registrations
* @param tournamentid id of the tournament to get registrations of
* @param asynchronous callback function called after this function is done.
*/
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

/**
* Retrieves all registrations of the given director. Callback with the list of
* all related registrations
* @param director id of the director to get registrations of
* @param asynchronous callback function called after this function is done.
*/
function findDirectorRegistrations(director, callback) {
    Registration.find({directorid : director._id}, function(err, registrations) {
        if (err) {
            return callback(err, []);
        } else {
            registrations.sort(function(first, second) {
                return second.signupTime - first.signupTime;
            });
            callback(null, registrations);
        }
    });
}

/**
* Retrieves one registration given a tournament and director. Callback with the
* registration (or null if not found)
* @param tournamentid id of the tournament to get registration from
* @param directorid id of the director associated with the registration
* @param asynchronous callback function called after this function is done.
*/
function findOneRegistration(tournamentid, directorid, callback) {
    Registration.findOne({tournamentid : tournamentid, directorid : directorid}, function(err, registration) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, registration);
        }
    });
}

/**
* Removes a registration associated with a tournament. Callback with an error
* or null
* @param regid registrationid associated with registration in collection
* @param asynchronous callback function called after this function is done.
*/
function removeRegistration(regid, callback) {
    Registration.remove({_id : regid}, function(err) {
        callback(err);
    });
}

exports.createRegistration = createRegistration;
exports.findRegistrationsByTournament = findRegistrationsByTournament;
exports.findDirectorRegistrations = findDirectorRegistrations;
exports.findOneRegistration = findOneRegistration;
exports.removeRegistration = removeRegistration;
