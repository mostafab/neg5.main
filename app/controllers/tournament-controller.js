var mongoose = require("mongoose");
var shortid = require("shortid");

var Tournament = mongoose.model("Tournament");
var TournamentDirector = mongoose.model("TournamentDirector");
var Team = mongoose.model("Team");
var Player = mongoose.model("Player");
var Game = mongoose.model("Game");

/**
* Adds a tournament to the specified td - "tournament director" array of tournaments
* @return true if adding tournament succeesed, false otherwise
*/
function addTournament(director, name, date, location, description, questionset, callback) {
    var tourney = new Tournament({
        directorid : director._id,
        directoremail : director.email,
        tournament_name : name,
        location : location,
        date : date,
        description : description,
        questionSet : questionset
    });
    tourney.shortID = shortid.generate();
    tourney.save(function(err) {
        if (err) {
            // console.log("Unable to save tournament");
            callback(err);
        } else {
            callback(null);
        }
    });
}

/**
* Returns a list of the tournaments owned by the given directorKey
* @return list of all the tournmanets with a director_email of directorKey.
* returns an empty list if result is empty
*/
function findTournamentsByDirector(directorKey, callback) {
    Tournament.find({$or : [{directorid : directorKey.toString()}, {"collaborators.id" : directorKey}]}, function(err, result) {
        if (err || result == null) {
            callback(err, null);
        } else {
            var tournamentInfo = [];
            for (var i = 0; i < result.length; i++) {
                var tournament = {};
                tournament._id = result[i]._id;
                tournament.tournament_name = result[i].tournament_name;
                tournament.shortID = result[i].shortID;
                tournament.location = result[i].location;
                tournament.date = result[i].date;
                tournament.questionSet = result[i].questionSet;
                tournament.teamsAdded = result[i].teams.length;
                tournamentInfo.push(tournament);
            }
            tournamentInfo.sort(function(first, second) {
                return second.date - first.date;
            });
            callback(null, tournamentInfo);
        }
    });
}

/**
* Gets a tournament given an id and sorts the games and teams before calling the
* callback function.
* @param id id of the tournament to get
* @param callback callback with the tournament found, or null
*/
function findTournamentById(id, callback) {
    var query = Tournament.findOne({shortID : id}, {"games.phases" : 0}).exec(function(err, result) {
        if (err || result == null) {
            callback(err, null);
        } else {
            result.games.sort(function(game1, game2) {
                return game1.round - game2.round;
            });
            result.teams.sort(function(team1, team2) {
                return team1.team_name.localeCompare(team2.team_name);
            });
            callback(null, result);
        }
    });
}

/**
* Adds a team and its players to a tournament given a tournamentid and
* information about the team like name and player names
* @param tournamentid id of the tournament to add team to
* @param teaminfo information about the team to add (name, division, and players)
* @param callback callback with an error (or null), the tournament's teams, and the new team
*/
function addTeamToTournament(tournamentid, teaminfo, callback) {
    var currentPlayer = 1;
    var key = "player" + currentPlayer + "_name";
    var newPlayers = [];
    var newteam = new Team({
        team_name : teaminfo["team_name"],
        division : !teaminfo["team_division"] ? "" : teaminfo["team_division"],
    });
    newteam.shortID = shortid.generate();
    while (teaminfo[key] !== undefined) {
        if (teaminfo[key].length !== 0) {
            var newplayer = new Player({
                teamID : newteam._id.toString(),
                player_name : teaminfo[key],
                team_name : teaminfo["players_team"],
            });
            newplayer.shortID = shortid.generate();
            newPlayers.push(newplayer);
        }
        currentPlayer++;
        key = "player" + currentPlayer + "_name";
    }
    var tournament = {_id : tournamentid};
    var updateQuery = {$push: {teams : newteam}};
    var updateQueryPlayers = {$push : {players : {$each : newPlayers}}};
    var options = {safe : true, upsert : true};
    Tournament.update(tournament, updateQuery, options, function(err) { // Add the team
        if (err) {
            callback(err, null, null);
        } else {
            Tournament.update(tournament, updateQueryPlayers, options, function(err) { // Add all players
                if (err) {
                    callback(err, null, null);
                } else {
                    Tournament.findOne({_id : tournamentid}, {teams : 1}).exec(function(err, result) {
                        if (err) {
                            callback(err, null, null);
                        } else {
                            callback(null, result.teams, newteam);
                        }
                    })
                }
            });
        }
    });
}

/**
* Finds a team's players given the id of the tournament and the teamid. Calls
* callback function with found players, the tournament's point scheme, and
* its point types
* @param tournamentid id of the tournament to get players from
* @param teamid used to check matching players
* @param callback function called after players are found.
*/
function findTeamMembers(tournamentid, teamid, callback) {
    var query = Tournament.findOne({_id : tournamentid}, {players : 1, pointScheme : 1, pointsTypes : 1}, function(err, result) {
        if (err || !result) {
            callback(err, [], null, null);
        } else {
            var playersArr = result.players.filter(function(player) {
                return player.teamID == teamid;
            });
            callback(null, playersArr, result.pointScheme, result.pointsTypes);
        }
    });
}

/**
* Adds a game to a tournament from the manual entry screen given
* a tournamentid, information about the game, and a callback.
* @param tournamentid id of the tournament to add a game to
* @param gameinfo information about the game to add
* @param phases phases of the game to add
* @param callback function called back with an error (or null) and the new game
*/
function addGameToTournament(tournamentid, gameinfo, phases, callback) {
    pointsJSONKeys = Object.keys(JSON.parse(gameinfo["pointValueForm"]));
    var newGame = new Game({
        round : !gameinfo["round"] ? 0 : gameinfo["round"],
        tossupsheard : !gameinfo["tossupsheard"] ? 0 : gameinfo["tossupsheard"],
        room : !gameinfo["room"] ? "-" : gameinfo["room"],
        moderator : !gameinfo["moderator"] ? "-" : gameinfo["moderator"],
        packet : !gameinfo["packet"] ? "-" : gameinfo["packet"],
        notes : !gameinfo["notes"] ? "-" : gameinfo["notes"]
    });
    newGame.phases = phases;
    newGame.shortID = shortid.generate();
    newGame.team1.team_id = gameinfo["leftteamselect"];
    newGame.team1.score = !gameinfo["leftteamscore"] ? "0" : gameinfo["leftteamscore"];
    newGame.team1.bouncebacks = !gameinfo["leftbounceback"] ? 0 : gameinfo["leftbounceback"];
    newGame.team1.team_name = gameinfo["leftteamname"];
    newGame.team2.team_id = gameinfo["rightteamselect"];
    newGame.team2.score = !gameinfo["rightteamscore"] ? "0" : gameinfo["rightteamscore"];
    newGame.team2.bouncebacks = !gameinfo["rightbounceback"] ? 0 : gameinfo["rightbounceback"];
    newGame.team2.team_name = gameinfo["rightteamname"];
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
    var tournament = {_id : tournamentid};
    var updateQuery = {$push: {games : newGame}};
    var options = {safe : true, upsert : true};
    Tournament.update(tournament, updateQuery, options, function(err) {
        if (err) {
            callback(err, []);
        } else {
            callback(null, newGame);
        }
    });
}

/**
* Function that takes the newly added-game to the tournament
* and projects the results to the teams involved
* @param tournamentid the unique id of the tournament the game took place at
* @param game the game to project onto involved teams
*/
function projectGameToTeams(tournamentid, game) {
    var winnerOrder = game.getWinner();
    // First, add information about teams themselves
    if (winnerOrder.length !== 3) {
        Tournament.update({_id : tournamentid ,"teams._id" : winnerOrder[0]},
                            {"$inc" : {"teams.$.wins" : 1}}, function(err) {
                                if (err) {
                                    console.log("Something bad happenned");
                                } else {
                                    Tournament.update({_id : tournamentid, "teams._id" : winnerOrder[1]},
                                    {"$inc" : {"teams.$.losses" : 1}}, function(err) {
                                        if (err) {
                                            console.log("Something bad happened down here");
                                        }
                                    });
                                }
        });
    } else {
        // Handles situation with ties
        Tournament.update({_id : tournamentid ,"teams._id" : winnerOrder[0]},
                            {"$inc" : {"teams.$.ties" : 1}}, function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    Tournament.update({_id : tournamentid, "teams._id" : winnerOrder[1]},
                                    {"$inc" : {"teams.$.ties" : 1}}, function(err) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
        });
    }
}

/**
* Projects a game's information about players to their
* respective documents
* @param tournamentid id of the tournament the game is at
* @param game the game whose information will be added
*/
function projectGameToPlayers(tournamentid, game) {
    var team1PlayerIDKeys = Object.keys(game.team1.playerStats);
    console.log(team1PlayerIDKeys);
    for (var i = 0; i < team1PlayerIDKeys.length; i++) {
        // Team on left side
        // console.log(game.team1.playerStats[team1PlayerIDKeys[i]]);
        console.log(i);
        var tournamentQuery = {_id : tournamentid, "players._id" : team1PlayerIDKeys[i]};
        var currentPlayerValueKeys = Object.keys(game.team1.playerStats[team1PlayerIDKeys[i]]);
        for (var j = 0; j < currentPlayerValueKeys.length; j++) {
            var valueToIncrement;
            if (currentPlayerValueKeys[j] === "gp") {
                valueToIncrement = "players.$.gamesPlayed";
            } else {
                valueToIncrement = "players.$.pointValues." + currentPlayerValueKeys[j];
            }
            var action = {};
            action[valueToIncrement] = game.team1.playerStats[team1PlayerIDKeys[i]][currentPlayerValueKeys[j]];
            console.log(action);
            var incrementQuery = {"$inc" : action};
            // console.log(incrementQuery);
            // console.log(game.team1.playerStats[team1PlayerIDKeys[i]][currentPlayerValueKeys[j]]);
            if (action[valueToIncrement]) {
                Tournament.update(tournamentQuery, incrementQuery, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    }
    var team2PlayerIDKeys = Object.keys(game.team2.playerStats);
    for (var i = 0; i < team2PlayerIDKeys.length; i++) {
        // Sliiiiide to the right
        console.log(i);
        var tournamentQuery = {_id : tournamentid, "players._id" : team2PlayerIDKeys[i]};
        var currentPlayerValueKeys = Object.keys(game.team2.playerStats[team2PlayerIDKeys[i]]);
        for (var j = 0; j < currentPlayerValueKeys.length; j++) {
            var valueToIncrement;
            if (currentPlayerValueKeys[j] === "gp") {
                valueToIncrement = "players.$.gamesPlayed";
            } else {
                valueToIncrement = "players.$.pointValues." + currentPlayerValueKeys[j];
            }
            var action = {};
            action[valueToIncrement] = game.team2.playerStats[team2PlayerIDKeys[i]][currentPlayerValueKeys[j]];
            console.log(action);
            var incrementQuery = {"$inc" : action};
            // console.log(incrementQuery);
            // console.log(game.team2.playerStats[team2PlayerIDKeys[i]][currentPlayerValueKeys[j]]);
            if (action[valueToIncrement]) {
                Tournament.update(tournamentQuery, incrementQuery, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    }
}

/**
* Function to get a specific game from the tournamentid. The resultant game
* returned from the query is used to remove the game
* @param tournamentid id of the tournament the game is associated with
* @param gameid id of the game to retrieve
*/
function getGameFromTournament(tournamentid, gameid, callback) {
    // if get game, then remove game from teams and players, then remove the actual game
    var tournamentQuery = {_id : tournamentid, "games.shortID" : gameid};
    Tournament.findOne(tournamentQuery, function(err, result) {
        // console.log("Result: " + result);
        if (err || result == null) {
            // DO STUFF
            callback(err);
        } else {
            for (var i = 0; i < result.games.length; i++) {
                if (result.games[i].shortID == gameid) {
                    // removeGameFromTeam(tournamentid, result.games[i]);
                    // removeGameFromPlayers(tournamentid, result.games[i]);
                    removeGameFromTournament(tournamentid, result.games[i]);
                    i = result.games.length + 1;
                    callback(null);
                }
            }
        }
    });
}

/**
* Removes a game from a tournament given a tournament id and the short id
* of the game to remove.
* @param tournamentid id of the tournament to remove a game from
* @param gameShortID short id of the game to remove
* @param callback function called back with an error (or null)
*/
function removeGameFromTournament(tournamentid, gameShortID, callback) {
    var tournamentQuery = {_id : tournamentid, "games.shortID" : gameShortID};
    var pullQuery = {$pull : {games : {shortID : gameShortID}}};
    // console.log(pullQuery);
    Tournament.findOne({_id : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null);
        } else {
            for (var i = 0; i < tournament.games.length; i++) {
                var phases = [];
                if (tournament.games[i].shortID === gameShortID) {
                    phases = tournament.games[i].phases ? tournament.games[i].phases : [];
                    break;
                }
            }
            Tournament.update(tournamentQuery, pullQuery, function(err) {
                callback(err, phases);
            });
        }
    });
}

// function removeGameFromTeam(tournamentid, game) {
//     var winnerOrder = game.getWinner();
//     // First, add information about teams themselves
//     if (winnerOrder.length !== 3) {
//         Tournament.update({_id : tournamentid ,"teams._id" : winnerOrder[0]},
//                             {"$inc" : {"teams.$.wins" : -1}}, function(err) {
//                                 if (err) {
//                                     console.log("Something bad happenned");
//                                 } else {
//                                     Tournament.update({_id : tournamentid, "teams._id" : winnerOrder[1]},
//                                     {"$inc" : {"teams.$.losses" : -1}}, function(err) {
//                                         if (err) {
//                                             console.log("Something bad happened down here");
//                                         }
//                                     });
//                                 }
//         });
//     } else {
//         // Handles situation with ties
//         Tournament.update({_id : tournamentid ,"teams._id" : winnerOrder[0]},
//                             {"$inc" : {"teams.$.ties" : -1}}, function(err) {
//                                 if (err) {
//                                     console.log(err);
//                                 } else {
//                                     Tournament.update({_id : tournamentid, "teams._id" : winnerOrder[1]},
//                                     {"$inc" : {"teams.$.ties" : -1}}, function(err) {
//                                         if (err) {
//                                             console.log(err);
//                                         }
//                                     });
//                                 }
//         });
//     }
// }
//
// function removeGameFromPlayers(tournamentid, game) {
//     if (game.team1.playerStats) {
//         var team1PlayerIDKeys = Object.keys(game.team1.playerStats);
//         // console.log(team1PlayerIDKeys);
//         for (var i = 0; i < team1PlayerIDKeys.length; i++) {
//             console.log("Removing game from players left");
//             // Team on left side
//             // console.log(game.team1.playerStats[team1PlayerIDKeys[i]]);
//             var tournamentQuery = {_id : tournamentid, "players._id" : team1PlayerIDKeys[i]};
//             var currentPlayerValueKeys = Object.keys(game.team1.playerStats[team1PlayerIDKeys[i]]);
//             for (var j = 0; j < currentPlayerValueKeys.length; j++) {
//                 var valueToIncrement;
//                 if (currentPlayerValueKeys[j] === "gp") {
//                     valueToIncrement = "players.$.gamesPlayed";
//                 } else {
//                     valueToIncrement = "players.$.pointValues." + currentPlayerValueKeys[j];
//                 }
//                 var action = {};
//                 action[valueToIncrement] = -1 * game.team1.playerStats[team1PlayerIDKeys[i]][currentPlayerValueKeys[j]];
//                 var incrementQuery = {"$inc" : action};
//                 console.log(incrementQuery);
//                 // console.log(game.team1.playerStats[team1PlayerIDKeys[i]][currentPlayerValueKeys[j]]);
//                 if (action[valueToIncrement]) {
//                     Tournament.update(tournamentQuery, incrementQuery, function(err) {
//                         if (err) {
//                             console.log(err);
//                         }
//                     });
//                 }
//             }
//         }
//     }
//     if (game.team2.playerStats) {
//         var team2PlayerIDKeys = Object.keys(game.team2.playerStats);
//         for (var i = 0; i < team2PlayerIDKeys.length; i++) {
//             console.log("Removing game from players right");
//             // Sliiiiide to the right
//             var tournamentQuery = {_id : tournamentid, "players._id" : team2PlayerIDKeys[i]};
//             var currentPlayerValueKeys = Object.keys(game.team2.playerStats[team2PlayerIDKeys[i]]);
//             for (var j = 0; j < currentPlayerValueKeys.length; j++) {
//                 var valueToIncrement;
//                 if (currentPlayerValueKeys[j] === "gp") {
//                     valueToIncrement = "players.$.gamesPlayed";
//                 } else {
//                     valueToIncrement = "players.$.pointValues." + currentPlayerValueKeys[j];
//                 }
//                 var action = {};
//                 action[valueToIncrement] = -1 * game.team2.playerStats[team2PlayerIDKeys[i]][currentPlayerValueKeys[j]];
//                 var incrementQuery = {"$inc" : action};
//                 console.log(incrementQuery);
//                 // console.log(game.team2.playerStats[team2PlayerIDKeys[i]][currentPlayerValueKeys[j]]);
//                 if (action[valueToIncrement]) {
//                     Tournament.update(tournamentQuery, incrementQuery, function(err) {
//                         if (err) {
//                             console.log(err);
//                         }
//                     });
//                 }
//             }
//         }
//     }
// }

/**
* Will remove a team from the tournament given the tournament's ID and a
* javascript object with information about the tournament and team short ID. The callback is
* called back with null if no errors arise after deleting the team and players, or with the err
* if something goes wrong or if the team cannot be found. removeTeamFromTournament works by first
* retrieving the team._id and then pulling out the players with that teamID and then removing the team
* @param tournamentid unique ObjectId of the tournament
* @param teaminfo Javascript object holding information about the team and tournament
* @param callback callback function called back after function is done
*/
function removeTeamFromTournament(tournamentid, teaminfo, callback) {
    // console.log(teaminfo);
    var tournamentQuery = {_id : tournamentid, "teams.shortID" : teaminfo.teamid_form};
    // console.log(tournamentQuery);
    Tournament.findOne(tournamentQuery, function(err, result) {
        if (err || result == null) {
            callback(err, null);
        } else {
            var teamid = -1;
            for (var i = 0; i < result.teams.length; i++) {
                if (result.teams[i].shortID === teaminfo.teamid_form) {
                    // console.log("Short ids match");
                    teamid = result.teams[i]._id.toString();
                    // console.log(teamid);
                    i = result.teams.length + 1;
                }
            }
            if (teamid === -1) {
                callback(err);
            } else {
                Tournament.update({_id : tournamentid}, {$pull : {players : {teamID : teamid}}}, function(err) {
                    if (err) {
                        // console.log(err);
                        callback(err, null);
                    } else {
                        Tournament.update({_id : tournamentid}, {$pull : {teams : {_id : teamid}}}, function(err) {
                            if (err) {
                                // console.log(err);
                                callback(err, null);
                            } else {
                                callback(null, teamid);
                            }
                        });
                    }
                });
            }
        }
    });
}

/**
* Updates a team's name, division, and player's teamname
* @param tournamentid id of the tournament to update
* @param teamid id of the team to update
* @param newinfo new information about the team
* @param callback function called back with an error (or null) and the team's
* new name
*/
function updateTeam(tournamentid, teamid, newinfo, callback) {
    Tournament.findOne({_id : tournamentid}, function(err, result) {
        if (err || result == null) {
            console.log(err);
            return callback(err, null);
        } else {
            for (var i = 0; i < result.teams.length; i++) {
                if (result.teams[i].team_name == newinfo.team_name
                        && result.teams[i]._id != newinfo.teamid) {
                    return callback(null, null);
                }
            }
            Tournament.update({_id : tournamentid, "teams._id" : newinfo.teamid},
                        {"$set" : {"teams.$.team_name" : newinfo.team_name, "teams.$.division" : newinfo.divisionform || ""}},
                    function(err) {
                        if (err) {
                            console.log(err);
                            return callback(err, null);
                        } else {
                            for (var i = 0; i < result.players.length; i++) {
                                if (result.players[i].teamID == newinfo.teamid) {
                                    Tournament.update({_id : tournamentid, "players._id" : result.players[i]._id},
                                            {"$set" : {"players.$.team_name" : newinfo.team_name}},
                                            function(err) {
                                                if (err) {
                                                    console.log(err);
                                                    return callback(err, null);
                                                }
                                            });
                                }
                            }
                            for (var i = 0; i < result.games.length; i++) {
                                if (result.games[i].team1.team_id == newinfo.teamid) {
                                    Tournament.update({_id : tournamentid, "games._id" : result.games[i]._id},
                                            {"$set" : {"games.$.team1.team_name" : newinfo.team_name}},
                                            function(err) {
                                                if (err) {
                                                    console.log(err);
                                                    return callback(err, null);
                                                }
                                            });
                                } else if (result.games[i].team2.team_id == newinfo.teamid) {
                                    // console.log("Game match found2");
                                    Tournament.update({_id : tournamentid, "games._id" : result.games[i]._id},
                                            {"$set" : {"games.$.team2.team_name" : newinfo.team_name}},
                                            function(err) {
                                                if (err) {
                                                    console.log(err);
                                                    return callback(err, null);
                                                }
                                            });
                                }
                            }
                            callback(null, newinfo.team_name);
                        }
                    });
                }
            });
}

/**
* Updates a player in a tournament given a tournamentID, playerID, and
* a new player name.
* @param tournamentID id of the tournament to update a player in
* @param playerID id of the player to edit
* @param newPlayerName new name of the player
* @param callback callback function called with an error (or null)
*/
function updatePlayer(tournamentID, playerID, newPlayerName, callback) {
    Tournament.update({_id : tournamentID, "players._id" : playerID},
            {"$set" : {"players.$.player_name" : newPlayerName}}, function(err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
}

/**
* Removes a player from a tournament given a tournamentid, playerid and a
* callback function
* @param tournamentID id of the tournament to remove a player from
* @param playerID id of the player to remove
* @param callback callback called with an error or null
*/
function removePlayer(tournamentID, playerID, callback) {
    var tournamentQuery = {_id : tournamentID, "players._id" : playerID};
    var pullQuery = {$pull : {players : {_id : playerID}}};
    Tournament.update(tournamentQuery, pullQuery, function(err) {
        callback(err);
    });
}

/**
*  Adds a player to a tournament given a tournament id, team name, team id, and a
* player name
* @param tournamentID id of the tournament to add a player to
* @param teamName name of the team
* @param teamID id of the team to link a player and team
* @param playerName name of the new player
* @param callback callback function with the new player and the tournament's point scheme
*/
function addPlayer(tournamentID, teamName, teamID, playerName, callback) {
    var tournamentQuery = {_id : tournamentID};
    var newPlayer = new Player({
        player_name : playerName,
        teamID : teamID,
        team_name : teamName
    });
    newPlayer.shortID = shortid.generate();
    Tournament.findOne(tournamentQuery, function(err, result) {
        if (!result) {
            callback(err, null);
        } else {
            newPlayer.pointValues = result.pointScheme;
            // console.log(newPlayer);
            var pushQuery = {$push : {players : newPlayer}};
            Tournament.update(tournamentQuery, pushQuery, function(err) {
                if (err) {
                    callback(err, null, null, null);
                } else {
                    callback(null, newPlayer, result.pointScheme, result.pointsTypes);
                }
            });
        }
    });
}

/**
* Changes a game's short ID back to the original after a game is deleted and needs to
* be updated with a new id
* @param tournamentid id of the tournament to change a game short id in
* @param currentID current shortID of the game
* @param newID new id of the game to revert back to
* @param callback callback function with an error (or null)
*/
function changeGameShortID(tournamentid, currentID, newID, callback) {
    Tournament.update({_id : tournamentid, "games.shortID" : currentID},
            {"$set" : {"games.$.shortID" : newID}}, function(err) {
                callback(err);
            });
}

/**
* Changes a tournament's point scheme
* @param tournamentid id of the tournament to change point scheme of
* @param newPointScheme new point scheme
* @param newPointTypes value of each point type
* @param callback callback function with error (or null)
*/
function changePointScheme(tournamentid, newPointScheme, newPointTypes, callback) {
    // console.log(newPointScheme);
    Tournament.update({_id : tournamentid},
            {"$set" : {pointScheme : newPointScheme, pointsTypes : newPointTypes}}, function(err) {
                console.log(err);
                callback(err);
            });
}

/**
* Updates a tournament's divisions
* @param tournamentid id of tournament to update divisions of
* @param divisions array of new divisions
* @param callback callback function with an error (or null)
*/
function updateDivisions(tournamentid, divisions, callback) {
    Tournament.update({_id : tournamentid},
            {"$set" : {divisions : divisions}}, function(err) {
                if (err) {
                    callback(err);
                } else {
                    Tournament.findOne({_id : tournamentid}, {divisions : 1}, function(err, tournament) {
                        if (err) {
                            callback(err, []);
                        } else {
                            tournament.divisions.sort(function(first, second) {
                                return first.localeCompare(second);
                            });
                            callback(err, tournament.divisions);
                        }
                    });
                }
            });
}

/**
* Updates general information about a tournament
* @param tournamentid id of the tournament to update
* @param information new information about the tournament
* @param callback callback with an error (or null)
*/
function updateTournamentInformation(tournamentid, information, callback) {
    Tournament.update({_id : tournamentid},
            {"$set" : {tournament_name : information.tournament_name, location : information.tournament_location,
                    date : information.tournament_date, description : information.tournament_description}}, function(err) {
                        callback(err);
                    });
}

/**
* Finds tournament collaborators given a search query
* @param query search query of collaborators to add
* @param callback callback with an array of directors found matching the query
*/
function findDirectors(query, callback) {
    query = query.trim();
    try {
        var rex = new RegExp(".*" + query + ".*", "i");
        TournamentDirector.find({$or : [{email : rex}, {name : rex}]}, function(err, directors) {
            if (err) {
                console.log(err);
                callback(err, []);
            } else {
                directors.sort(function(first, second) {
                    return first.name.localeCompare(second.name);
                });
                callback(null, directors);
            }
        });
    } catch (err) {
        callback(err, []);
    }
}

/**
* Add a collaborator to a tournament if not already a collaborator in the
* tournament
* @param tournamentid id of the tournament to add collaborator to
* @param collaborator collaborator to add
* @param callback with an error or (null) and a boolean representing if collaborator
* already existed before-hand
*/
function addCollaborator(tournamentid, collaborator, callback) {
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err || tournament == null) {
            callback(err);
        } else {
            for (var j = 0; j < tournament.collaborators.length; j++) {
                if (tournament.collaborators[j].id == collaborator.id || collaborator.id == tournament.directorid) {
                    return callback(null, true);
                }
            }
            Tournament.update({shortID : tournamentid}, {$push : {collaborators : collaborator}}, function(err) {
                if (err) {
                    return callback(err, false);
                } else {
                    return callback(null, false);
                }
            });
        }
    });
}

/**
* Removes a collaborator from a tournament
* @param tournamentid id of the tournament to remove collaborator from
* @param collaboratorid id of collaborator
* @param callback callback with an error (or null)
*/
function removeCollaborator(tournamentid, collaboratorid, callback) {
    Tournament.update({shortID : tournamentid}, {$pull : {collaborators : {id : collaboratorid}}}, function(err) {
        callback(err);
    });
}

/**
* Finds all a tournament's collaborators
* @param tournamentid id of the tournament to get collaborators from
* @param callback callback function with an array of collaborators
*/
function findCollaborators(tournamentid, callback) {
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err || result == null) {
            callback(err, []);
        } else {
            callback(null, result.collaborators);
        }
    });
}

/**
* Adds a subsmitted scoresheet as a game
* @param tournamentid id of the tournament to add game to
* @param scoresheet scoresheet to add
* @param callback callback with the new game's shortID
*/
function addScoresheetAsGame(tournamentid, game, scoresheet, callback) {
    var newGame = new Game();
    newGame = game;
    newGame.shortID = shortid.generate();
    newGame.phases = !scoresheet.phases ? [] : scoresheet.phases;
    for (var i = 0; i < newGame.phases.length; i++) {
        if (!newGame.phases[i].tossup) {
            newGame.phases[i].tossup = {answers : []};
        }
        if (!newGame.phases[i].bonus.bonusParts) {
            newGame.phases[i].bonus.bonusParts = [];
        }
    }
    Tournament.update({_id : tournamentid}, {$push : {games : newGame}}, function(err) {
        if (err) {
            callback(err, "");
        } else {
            callback(null, newGame.shortID);
        }
    });
}

/**
* Clones a tournament as a new phase. Has same teams and players as given tournamentid
* @param tournamentid id of the tournament to clone
* @param phaseName name of the new tournament
* @param callback callback function with new tournament id and an error (or null)
*/
function cloneTournament(tournamentid, phaseName, callback) {
    Tournament.findOne({_id : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null);
        } else if (!tournament) {
            callback(null, null);
        } else {
            var newTournament = new Tournament();
            newTournament.tournament_name = phaseName;
            newTournament.shortID = shortid.generate();
            newTournament.teams = tournament.teams;
            newTournament.players = tournament.players;
            newTournament.directorid = tournament.directorid;
            newTournament.collaborators = tournament.collaborators;
            newTournament.location = tournament.location;
            newTournament.date = tournament.date;
            newTournament.questionSet = tournament.questionSet;
            newTournament.description = tournament.description;
            newTournament.pointScheme = tournament.pointScheme;
            newTournament.pointsTypes = tournament.pointsTypes;

            newTournament.save(function(err) {
                callback(err, newTournament.shortID);
            });
        }
    });
}

/**
* Merges two tournaments together given their ids and a name for the resultant
* tournament.
* @param firstTournamentID id of first tournament
* @param secondTournamentID id of the second tournament
* @param name name of the new tournament
* @param callback callback with the new tournament (or null if error) and an error (or null)
*/
function mergeTournaments(firstTournamentID, secondTournamentID, name, callback) {
    var mergedTourney = new Tournament();
    mergedTourney.tournament_name = name;
    mergedTourney.shortID = shortid.generate();
    mergedTourney.teams = [];
    mergedTourney.players = [];
    mergedTourney.games = [];
    Tournament.findOne({_id : firstTournamentID}, function(err, first) {
        if (err) {
            callback(err, null);
        } else if (!first) {
            callback(null, null);
        } else {
            mergedTourney.teams = first.teams;
            mergedTourney.players = first.players;
            mergedTourney.divisions = first.divisions;
            mergedTourney.games = mergedTourney.games.concat(first.games);
            mergedTourney.collaborators = first.collaborators;
            var date = new Date(first.date);
            mergedTourney.date = date;
            mergedTourney.location = first.location;
            mergedTourney.directorid = first.directorid;
            mergedTourney.questionSet = first.questionSet;
            mergedTourney.description = first.description;
            mergedTourney.pointsTypes = first.pointsTypes;
            mergedTourney.pointScheme = first.pointScheme;

            Tournament.findOne({_id : secondTournamentID}, function(err, second) {
                if (err) {
                    callback(err, null);
                } else if (!second) {
                    callback(null, null);
                } else {
                    mergedTourney.games = mergedTourney.games.concat(second.games);
                    var existingTeams = {};
                    var existingPlayers = {};
                    for (var i = 0; i < mergedTourney.teams.length; i++) {
                        existingTeams[mergedTourney.teams[i]._id] = true;
                    }
                    for (var i = 0; i < mergedTourney.players.length; i++) {
                        existingPlayers[mergedTourney.players[i]._id] = true;
                    }
                    for (var i = 0; i < second.teams.length; i++) {
                        if (!existingTeams[second.teams[i]._id]) {
                            mergedTourney.teams.push(second.teams[i]);
                        }
                    }
                    for (var i = 0; i < second.players.length; i++) {
                        if (!existingPlayers[second.players[i]._id]) {
                            mergedTourney.players.push(second.players[i]);
                        }
                    }
                    mergedTourney.save(function(err) {
                        callback(err, mergedTourney);
                    });
                }
            });
        }
    });
}



/**
* Deletes a tournament from the database
* @param directorid id of the logged in director
* @param tournamentid id of the tournament to delete
* @param callback callback with an error (or null) and indication of success
*/
function deleteTournament(directorid, tournamentid, callback) {
    Tournament.findOne({_id : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null);
        } else if (tournament.directorid == directorid) {
            Tournament.remove({_id : tournamentid}, function(err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, null);
                }
            });
        } else {
            callback(null, "Unauthorized");
        }
    });
}

exports.addTournament = addTournament;
exports.findTournamentsByDirector = findTournamentsByDirector;
exports.findTournamentById = findTournamentById;
exports.addTeamToTournament = addTeamToTournament;
exports.findTeamMembers = findTeamMembers;
exports.addGameToTournament = addGameToTournament;
exports.removeGameFromTournament = removeGameFromTournament;
exports.changeGameShortID = changeGameShortID;
exports.removeTeamFromTournament = removeTeamFromTournament;
exports.updateTeam = updateTeam;
exports.findDirectors = findDirectors;
exports.updatePlayer = updatePlayer;
exports.removePlayer = removePlayer;
exports.addPlayer = addPlayer;
exports.changePointScheme = changePointScheme;
exports.updateDivisions = updateDivisions;
exports.updateTournamentInformation = updateTournamentInformation;
exports.addCollaborator = addCollaborator;
exports.findCollaborators = findCollaborators;
exports.removeCollaborator = removeCollaborator;
exports.addScoresheetAsGame = addScoresheetAsGame;
exports.cloneTournament = cloneTournament;
exports.mergeTournaments = mergeTournaments;
exports.deleteTournament = deleteTournament;
