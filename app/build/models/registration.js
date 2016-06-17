'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/**
* Schema for a registration
*/
var RegistrationSchema = new Schema({
    teamName: String,
    numTeams: Number,
    email: { type: String, set: function set(email) {
            return email.toLowerCase();
        } },
    tournamentid: String,
    tournamentName: String,
    directorid: String,
    message: String,
    signupTime: { type: Date, default: Date.now() }
});

module.exports = mongoose.model("Registration", RegistrationSchema);