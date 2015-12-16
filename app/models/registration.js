var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RegistrationSchema = new Schema({
    teamName : String,
    numTeams : Number,
    contactInformation : {type : {}},
    tournamentid : String,
    directorid : String,
    message : String,
    signupTime : {type : Date, default : Date.now}
});

module.exports = mongoose.model("Registration", RegistrationSchema);
