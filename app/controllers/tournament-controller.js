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
        director_email : directorKey,
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
    var newteam = new Team({
        team_name : teaminfo["team_name"],
        email : teaminfo["team_email"],
        division : teaminfo["team_division"],
    });
    while (teaminfo[key]) {
        if (teaminfo[key].length != 0)
            var newplayer = new Player({
                teamID : newteam._id.toString(),
                player_name : teaminfo[key],
                team_name : teaminfo["players_team"],
            });
            newPlayers.push(newplayer);
        currentPlayer++;
        key = "player" + currentPlayer + "_name";
    }
    var tournament = {_id : tournamentid};
    var updateQuery = {$push: {teams : newteam}};
    var updateQueryPlayers = {$push : {players : {$each : newPlayers}}};
    var options = {safe : true, upsert : true};
    Tournament.update(tournament, updateQuery, options, function(err) { // Add the team
        if (err) {
            callback(err, null);
        } else {
            Tournament.update(tournament, updateQueryPlayers, options, function(err) { // Add all players
                if (err) {
                    callback(err, null);
                } else {
                    Tournament.findOne({_id : tournamentid}).exec(function(err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, result.teams);
                        }
                    })
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
            var playersArr = [];
            for (var i = 0; i < result.players.length; i++) {
                if (result.players[i].teamID == teamid) {
                    playersArr.push(result.players[i]);
                }
            }
            callback(null, playersArr);
        }
    });
}

function addGameToTournament(tournamentid, gameinfo, callback) {
    pointsJSONKeys = Object.keys(JSON.parse(gameinfo["pointValueForm"]));
    console.log(gameinfo);
    var newGame = new Game({
        round : gameinfo["round"],
        tossupsheard : gameinfo["tossupsheard"],
    });
    newGame.team1.team_id = gameinfo["leftteamselect"];
    newGame.team1.score = gameinfo["leftteamscore"] == null ? "0" : gameinfo["leftteamscore"];
    newGame.team2.team_id = gameinfo["rightteamselect"];
    newGame.team2.score = gameinfo["rightteamscore"] == null ? "0" : gameinfo["rightteamscore"];
    var playerNum = 1;
    var playerleft = "player" + playerNum + "_leftid";
    newGame.team1.playerStats = {};
    while (gameinfo[playerleft]) {
        newGame.team1.playerStats[gameinfo[playerleft]] = {
                                                        gp : gameinfo["player" + playerNum + "_leftgp"]
                                                        };

        for (var i = 0; i < pointsJSONKeys.length; i++) {
            var currentVal = pointsJSONKeys[i];
            newGame.team1.playerStats[gameinfo[playerleft]][currentVal] = gameinfo["player" + playerNum + "_left_" + currentVal + "val"];
        }
        playerNum++;
        playerleft = "player" + playerNum + "_leftid";
    }
    playerNum = 1;
    var playerright = "player" + playerNum + "_rightid";
    newGame.team2.playerStats = {};
    while (gameinfo[playerright]) {
        newGame.team2.playerStats[gameinfo[playerright]] = {
                                                        gp : gameinfo["player" + playerNum + "_rightgp"]
                                                          };
        for (var i = 0; i < pointsJSONKeys.length; i++) {
            var currentVal = pointsJSONKeys[i];
            newGame.team2.playerStats[gameinfo[playerright]][currentVal] = gameinfo["player" + playerNum + "_right_" + currentVal + "val"];
        }
        playerNum++;
        playerright = "player" + playerNum + "_rightid";
    }
    console.log(newGame);
    // console.log(newGame.team1.playerStats);
    // console.log(newGame.team2.playerStats);
    callback(null, []);
}

exports.addTournament = addTournament;
exports.findTournamentsByDirector = findTournamentsByDirector;
exports.findTournamentById = findTournamentById;
exports.addTeamToTournament = addTeamToTournament;
exports.findTeamMembers = findTeamMembers;
exports.addGameToTournament = addGameToTournament;
