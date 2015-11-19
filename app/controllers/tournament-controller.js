var mongoose = require("mongoose");

var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var Team = mongoose.model("Team");
var Player = mongoose.model("Player");
var Game = mongoose.model("Game");

/**
* Adds a tournament to the specified td - "tournament director" array of tournaments
* @return true if adding tournament succeesed, false otherwise
*/
function addTournament(directorKey, name, date, location, description, questionset) {
    var tourney = new Tournament({
        director_email : directorKey, // Foreign Key
        tournament_name : name,
        location : location,
        date : date,
        description : description,
        questionSet : questionset,
    });
    tourney.save(function(err) {
        if (err) {
            // console.log("Unable to save tournament");
            return false;
        } else {

        }
    });
    return true;
}

/**
* Returns a list of the tournaments owned by the given directorKey
* @return list of all the tournmanets with a director_email of directorKey.
* returns an empty list if result is empty
*/
function findTournamentsByDirector(directorKey, callback) {
    var query = Tournament.find({director_email : directorKey}).exec(function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

function findTournamentById(id, callback) {
    var query = Tournament.findOne({_id : id}).exec(function(err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

function addTeamToTournament(tournamentid, teaminfo, callback) {
    var currentPlayer = 1;
    var key = "player" + currentPlayer + "_name";

    var newPlayers = [];
    while (teaminfo[key]) {
        console.log(key)
        if (teaminfo[key].length != 0)
            var newplayer = new Player({
                player_name : teaminfo[key],
            });
            newPlayers.push(newplayer);
        currentPlayer++;
        key = "player" + currentPlayer + "_name";
    }
    var newteam = new Team({
        team_name : teaminfo["team_name"],
        email : teaminfo["team_email"],
        division : teaminfo["team_division"],
        players : newPlayers
    });
    var tournament = {_id : tournamentid};
    var updateQuery = {$push: {teams : newteam}};
    var options = {safe : true, upsert : true};
    Tournament.update(tournament, updateQuery, options, function(err) {
        if (err) {
            callback(err, null);
        } else {
            Tournament.findOne({_id : tournamentid}).exec(function(err, result) {
                if (err) {
                    callback(err, result.teams);
                } else {
                    callback(null, result.teams);
                }
            });
        }
    });
}

// function addPlayersToTournament(tournamentid, players, callback) {
//     var tournament = {_id : tournamentid};
//     var options = {safe : true, upsert : true};
//     var currentPlayer = 1;
//     var key = "player" + currentPlayer + "_name";
//
//     var newPlayers = [];
//     while (players[key]) {
//         console.log(key)
//         if (players[key].length != 0)
//             var newplayer = new Player({
//                 player_name : players[key],
//                 team : players["players_team"],
//             });
//             newPlayers.push(newplayer);
//         currentPlayer++;
//         key = "player" + currentPlayer + "_name";
//     }
//     var updateQuery = {$push : {players : {$each : newPlayers}}};
//     Tournament.update(tournament, updateQuery, options, function(err) {
//         if (err) {
//             callback(err);
//         } else {
//             callback(null);
//         }
//     });

    // while (players[key]) {
    //     console.log(key)
    //     if (players[key].length != 0)
    //         var newplayer = new Player({
    //             player_name : players[key],
    //             team : players["players_team"],
    //         });
    //         var updateQuery = {$push : {players : newplayer}};
    //         Tournament.update(tournament, updateQuery, options, function(err) {
    //             if (err) {
    //                 callback(err);
    //             } else {
    //                 callback(null);
    //             }
    //         });
    //     currentPlayer++;
    //     key = "player" + currentPlayer + "_name";
    // }
// }

function findTeamMembers(tournamentid, teamid, callback) {
    var query = Tournament.findOne({_id : tournamentid}).exec(function(err, result) {
        if (err) {
            callback(err, []);
        } else {
            var found = false;
            var i = 0;
            while (!found) {
                if (result.teams[i]._id == teamid) {
                    found = true;
                    callback(null, result.teams[i].players);
                }
                i++;
            }
            // for (var i = 0; i < result.teams.length; i++) {
            //     if (result.teams[i].team == teamname) {
            //         members.push(result.players[i]);
            //     }
            // }
            // callback(null, members);
        }
    });
}

exports.addTournament = addTournament;
exports.findTournamentsByDirector = findTournamentsByDirector;
exports.findTournamentById = findTournamentById;
exports.addTeamToTournament = addTeamToTournament;
// exports.addPlayersToTournament = addPlayersToTournament;
exports.findTeamMembers = findTeamMembers;
