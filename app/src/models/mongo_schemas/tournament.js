'use strict';

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamSchema = require("./team").schema;
const gameSchema = require("./game").schema;
const playerSchema = require("./player").schema;

/**
* Schema for a tournament. Tournaments include a list of collaborators,
* teams, players, games, and other information like pointScheme and pointsTypes
* used to generate statistics.
* For pointsTypes, there are three possible options:
*                   "P" : Power
*                   "B" : Base Point Value
*                   "N" : Neg
*/
const TournamentSchema = new Schema({
    createdAt : {type : Date, default : Date.now()},
    directorid : String,
    tournament_name : {type : String, required : true},
    collaborators : [{}],
    location : String,
    date : {type : Date, set : setDate},
    questionSet : String,
    description : String,
    teams : [teamSchema],
    players : [playerSchema],
    divisions : [],
    phases : [],
    games : [gameSchema],
    pointScheme : {type : {}, default : {"15" : 0, "10" : 0, "-5" : 0}},
    pointsTypes : {type : {}, default : {"15" : "P", "10" : "B", "-5" : "N"}},
    shortID : {type : String, index : true, unique : true, required : true},
    hidden : {type : Boolean, default : true}
});

function setDate(date) {
    if (!date) {
        return new Date();
    } else {
        return date;
    }
}

module.exports = mongoose.model("Tournament", TournamentSchema);
