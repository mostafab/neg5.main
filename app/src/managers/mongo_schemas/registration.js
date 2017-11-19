'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
* Schema for a registration
*/
const RegistrationSchema = new Schema({
    teamName : String,
    numTeams : Number,
    email : {type : String, set : email => {
        return email.toLowerCase();
    }},
    tournamentid : String,
    tournamentName : String,
    directorid : String,
    message : String,
    signupTime : {type : Date, default : Date.now()}
});

module.exports = mongoose.model("Registration", RegistrationSchema);
