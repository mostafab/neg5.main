// 'use strict';

// const mongoose = require("mongoose");
// const shortid = require("shortid");

// const Tournament = mongoose.model("Tournament");
// const TournamentDirector = mongoose.model("TournamentDirector");
// const Team = mongoose.model("Team");
// const Player = mongoose.model("Player");
// const Game = mongoose.model("Game");

// const statsController = require("./stats-controller");

// /**
// * Adds a tournament to the specified td - "tournament director" array of tournaments
// * @return true if adding tournament succeesed, false otherwise
// */
// function addTournament(director, name, date, location, description, questionset, callback) {
//     const tourney = new Tournament({
//         directorid : director._id,
//         directoremail : director.email,
//         tournament_name : name,
//         location : location,
//         date : date,
//         description : description,
//         questionSet : questionset,
//         phases : [{phase_id : shortid.generate(), name : "Default Phase", active : true}]
//     });
//     tourney.shortID = shortid.generate();
//     tourney.save(err => {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else {
//             callback(null, tourney.shortID);
//         }
//     });
// }

// /**
// * Returns a list of the tournaments owned by the given directorKey
// * @return list of all the tournmanets with a director_email of directorKey.
// * returns an empty list if result is empty
// */
// function findTournamentsByDirector(directorKey, callback) {
//     Tournament.find({$or : [{directorid : directorKey.toString()}, {"collaborators.id" : directorKey}]}, (err, result) => {
//         if (err) {
//             callback(err);
//         } else {
//             let tournamentInfo = [];
//             result.forEach(doc => {
//                 const tournament = {};
//                 tournament._id = doc._id;
//                 tournament.directorid = doc.directorid;
//                 tournament.tournament_name = doc.tournament_name;
//                 tournament.shortID = doc.shortID;
//                 tournament.location = doc.location;
//                 tournament.date = doc.date;
//                 tournament.questionSet = doc.questionSet;
//                 tournament.teamsAdded = doc.teams.length;
//                 tournamentInfo.push(tournament);
//             });
//             tournamentInfo.sort((first, second) => {
//                 return second.date - first.date;
//             });
//             callback(null, tournamentInfo);
//         }
//     });
// }

// /**
// * Gets a tournament given an id and sorts the games and teams before calling the
// * callback function.
// * @param id id of the tournament to get
// * @param callback callback with the tournament found, or null
// */
// function findTournamentById(id, callback) {
//     const query = Tournament.findOne({shortID : id}, {"games.phases" : 0}).exec((err, result) => {
//         if (err || result == null) {
//             return callback(err, null);
//         } else if (!result) {
//             return callback(null, null);
//         } else {
//             TournamentDirector.findOne({_id : result.directorid}, {name : 1, email : 1, _id : 0}, (err, director) => {
//                 if (err) {
//                     return callback(err);
//                 } else {
//                     if (!result.phases) {
//                         result.phaseName = "Full Tournament";
//                     } else {
//                         for (let i = 0; i < result.phases.length; i++) {
//                             if (result.phases[i].active) {
//                                 result.phaseName = result.phases[i].name;
//                                 break;
//                             }
//                         }
//                     }
//                     result.divisions.sort((first, second) => {
//                         if (!first.name || !second.name) {
//                             return first.localeCompare(second);
//                         } else {
//                             return first.name.localeCompare(second.name);
//                         }
//                     });
//                     result.games.sort((game1, game2) => {
//                         return game1.round - game2.round;
//                     });
//                     result.teams.sort((team1, team2) => {
//                         return team1.team_name.localeCompare(team2.team_name);
//                     });
//                     result.teamMap = statsController.makeTeamMap(result.teams);
//                     return callback(null, result, director);
//                 }
//             });
//         }
//     });
// }

// function getTeams(tid, callback) {
//     Tournament.findOne({shortID : tid}, {teams : 1, phases : 1, shortID : 1, directorid : 1, collaborators : 1}, (err, result) => {
//         if (err) {
//             callback(err);
//         } else if (!result) {
//             callback(null, null);
//         } else {
//             result.teams.sort((first, second) => {
//                 return first.team_name.localeCompare(second.team_name);
//             });
//             callback(null, result);
//         }
//     });
// }

// function getGames(tid, callback) {
//     Tournament.findOne({shortID : tid}, {teams : 1, games : 1, phases : 1, shortID : 1, directorid : 1, collaborators : 1}, (err, result) => {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else if (!result) {
//             callback(null, null);
//         } else {
//             result.games.sort((first, second) => {
//                 return first.round - second.round;
//             });
//             callback(null, result);
//         }
//     });
// }

// function loadTournamentScoresheet(id, callback) {
//     Tournament.findOne({shortID : id},
//             {tournament_name : 1, shortID : 1, teams : 1, collaborators : 1,
//                     directorid : 1, "games.round" : 1, phases : 1}, (err, tournament) => {
//         if (err) {
//             return callback(err);
//         } else {
//             if (tournament.games.length === 0) {
//                 tournament.maxRound = 1;
//             } else {
//                 tournament.games.sort((first, second) => {
//                     return second.round - first.round;
//                 });
//                 if (tournament.games.length === 0) {
//                     tournament.maxRound = 1;
//                 } else {
//                     tournament.maxRound = tournament.games[0].round + 1;
//                 }
//             }
//             return callback(null, tournament);
//         }
//     });
// }

// /**
// * Adds a team and its players to a tournament given a tournamentid and
// * information about the team like name and player names
// * @param tournamentid id of the tournament to add team to
// * @param teaminfo information about the team to add (name, division, and players)
// * @param callback callback with an error (or null), the tournament's teams, and the new team
// */
// function addTeamToTournament(tournamentid, teaminfo, callback) {
//     let newPlayers = [];
//     const newTeam = new Team({
//         team_name : teaminfo.teamName,
//         divisions : teaminfo.divisions,
//         shortID : shortid.generate()
//     });
//     if (teaminfo.players) {
//         teaminfo.players.forEach(playerName => {
//             const newPlayer = new Player({
//                 teamID : newTeam._id.toString(),
//                 player_name : playerName,
//                 shortID : shortid.generate()
//             });
//             newPlayers.push(newPlayer);
//         });
//     }
//     const tournament = {_id : tournamentid};
//     const updateQuery = {$push: {teams : newTeam, players : {$each : newPlayers}}};
//     Tournament.update(tournament, updateQuery, err => {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else {
//             Tournament.findOne({_id : tournamentid}, {teams : 1, collaborators : 1, directorid : 1, phases : 1, shortID : 1}, (err, result) => {
//                 if (err) {
//                     callback(err);
//                 } else {
//                     result.teams.sort((first, second) => {
//                         return first.team_name.localeCompare(second.team_name);
//                     });
//                     callback(null, result);
//                 }
//             });
//         }
//     });
// }

// /**
// * Finds a team's players given the id of the tournament and the teamid. Calls
// * callback function with found players, the tournament's point scheme, and
// * its point types
// * @param tournamentid id of the tournament to get players from
// * @param teamid used to check matching players
// * @param callback function called after players are found.
// */
// function findTeamMembers(tournamentid, teamid, callback) {
//     const query = Tournament.findOne({_id : tournamentid}, (err, result) => {
//         if (err) {
//             callback(err);
//         } else if (result) {
//             let playersArr = result.players.filter((player) => {
//                 return player.teamID == teamid;
//             });
//             playersArr.sort((first, second) => {
//                 let secondGP = second.getTotalGamesPlayed(result);
//                 let firstGP = first.getTotalGamesPlayed(result);
//                 if (secondGP === firstGP) {
//                     return first.player_name.localeCompare(second.player_name);
//                 }
//                 return secondGP - firstGP;
//             });
//             callback(null, playersArr, result.pointScheme, result.pointsTypes);
//         } else {
//             callback(null, [], {}, {});
//         }
//     });
// }

// /**
// * Adds a game to a tournament from the manual entry screen given
// * a tournamentid, information about the game, and a callback.
// * @param tournamentid id of the tournament to add a game to
// * @param gameinfo information about the game to add
// * @param phases phases of the game to add
// * @param callback function called back with an error (or null) and the new game
// */
// function addGameToTournament(tournamentid, gameinfo, phases, callback) {
//     const pointsJSONKeys = Object.keys(JSON.parse(gameinfo["pointValueForm"]));
//     const newGame = new Game({
//         round : !gameinfo.round ? 0 : gameinfo.round,
//         tossupsheard : !gameinfo.tossupsheard ? 0 : gameinfo.tossupsheard,
//         room : !gameinfo.room ? "-" : gameinfo.room,
//         moderator : !gameinfo.moderator ? "-" : gameinfo.moderator,
//         packet : !gameinfo.packet ? "-" : gameinfo.packet,
//         notes : !gameinfo.notes ? "-" : gameinfo.notes
//     });
//     newGame.phases = phases;
//     newGame.phase_id = gameinfo.phase_id;
//     newGame.shortID = shortid.generate();
//     newGame.team1.team_id = gameinfo.leftteamselect;
//     newGame.team1.score = !gameinfo.leftteamscore ? 0 : gameinfo.leftteamscore;
//     newGame.team1.bouncebacks = !gameinfo.leftbounceback ? 0 : gameinfo.leftbounceback;
//     newGame.team1.overtimeTossupsGotten = !gameinfo.overtimetu1 ? 0 : gameinfo.overtimetu1;
//     newGame.team2.team_id = gameinfo.rightteamselect;
//     newGame.team2.score = !gameinfo.rightteamscore ? 0 : gameinfo.rightteamscore;
//     newGame.team2.bouncebacks = !gameinfo.rightbounceback ? 0 : gameinfo.rightbounceback;
//     newGame.team2.overtimeTossupsGotten = !gameinfo.overtimetu2 ? 0 : gameinfo.overtimetu2;
//     let playerNum = 1;
//     let playerleft = "player" + playerNum + "_leftid";
//     newGame.team1.playerStats = {};
//     while (gameinfo[playerleft]) {
//         newGame.team1.playerStats[gameinfo[playerleft]] = {
//                                                         gp : gameinfo["player" + playerNum + "_leftgp"]
//                                                         };
//         pointsJSONKeys.forEach(pv => {
//             newGame.team1.playerStats[gameinfo[playerleft]][pv] = gameinfo["player" + playerNum + "_left_" + pv + "val"];
//         });
//         playerNum++;
//         playerleft = "player" + playerNum + "_leftid";
//     }
//     playerNum = 1;
//     let playerright = "player" + playerNum + "_rightid";
//     newGame.team2.playerStats = {};
//     while (gameinfo[playerright]) {
//         newGame.team2.playerStats[gameinfo[playerright]] = {
//                                                         gp : gameinfo["player" + playerNum + "_rightgp"]
//                                                           };
//         pointsJSONKeys.forEach(pv => {
//             newGame.team2.playerStats[gameinfo[playerright]][pv] = gameinfo["player" + playerNum + "_right_" + pv + "val"];
//         });
//         playerNum++;
//         playerright = "player" + playerNum + "_rightid";
//     }
//     const tournament = {_id : tournamentid};
//     const updateQuery = {$push: {games : newGame}};
//     Tournament.update(tournament, updateQuery, err => {
//         if (err) {
//             callback(err);
//         } else {
//             Tournament.findOne(tournament, {games : 1, phases : 1, shortID : 1, teams : 1, directorid : 1, collaborators : 1}, (err, result) => {
//                 if (err) {
//                     callback(err);
//                 } else {
//                     result.games.sort((first, second) => {
//                         return first.round - second.round;
//                     });
//                     result.teamMap = statsController.makeTeamMap(result.teams);
//                     callback(null, result, newGame);
//                 }
//             });
//         }
//     });
// }

// /**
// * Function to get a specific game from the tournamentid. The resultant game
// * returned from the query is used to remove the game
// * @param tournamentid id of the tournament the game is associated with
// * @param gameid id of the game to retrieve
// */
// function getGameFromTournament(tournamentid, gameid, callback) {
//     const tournamentQuery = {_id : tournamentid, "games.shortID" : gameid};
//     Tournament.findOne(tournamentQuery, (err, result) => {
//         if (err) {
//             callback(err);
//         } else if (result) {
//             for (let i = 0; i < result.games.length; i++) {
//                 if (result.games[i].shortID == gameid) {
//                     removeGameFromTournament(tournamentid, result.games[i]);
//                     return callback(null);
//                 }
//             }
//         } else {
//             callback(null);
//         }
//     });
// }

// /**
// * Removes a game from a tournament given a tournament id and the short id
// * of the game to remove.
// * @param tournamentid id of the tournament to remove a game from
// * @param gameShortID short id of the game to remove
// * @param callback function called back with an error (or null)
// */
// function removeGameFromTournament(tournamentid, gameShortID, callback) {
//     const tournamentQuery = {_id : tournamentid, "games.shortID" : gameShortID};
//     const pullQuery = {$pull : {games : {shortID : gameShortID}}};
//     Tournament.findOne({_id : tournamentid}, (err, tournament) => {
//         if (err) {
//             callback(err);
//         } else {
//             let phases = [];
//             for (let i = 0; i < tournament.games.length; i++) {
//                 if (tournament.games[i].shortID === gameShortID) {
//                     phases = tournament.games[i].phases ? tournament.games[i].phases : [];
//                     break;
//                 }
//             }
//             Tournament.update(tournamentQuery, pullQuery, err => {
//                 callback(err, phases);
//             });
//         }
//     });
// }

// /**
// * Will remove a team from the tournament given the tournament's ID and a
// * javascript object with information about the tournament and team short ID. The callback is
// * called back with null if no errors arise after deleting the team and players, or with the err
// * if something goes wrong or if the team cannot be found. removeTeamFromTournament works by first
// * retrieving the team._id and then pulling out the players with that teamID and then removing the team
// * @param tournamentid unique ObjectId of the tournament
// * @param teaminfo Javascript object holding information about the team and tournament
// * @param callback callback function called back after function is done
// */
// function removeTeamFromTournament(tournamentid, teaminfo, callback) {
//     const tournamentQuery = {_id : tournamentid, "teams.shortID" : teaminfo.teamid_form};
//     const fields = {teams : 1, games : 1};
//     Tournament.findOne(tournamentQuery, fields, (err, result) => {
//         if (err || result == null) {
//             callback(err, null);
//         } else {
//             let teamid = -1;
//             const teamMap = statsController.makeTeamMap(result.teams);
//             for (let i = 0; i < result.teams.length; i++) {
//                 if (result.teams[i].shortID === teaminfo.teamid_form) {
//                     teamid = result.teams[i]._id.toString();
//                     let gamesWithTeam = result.games.filter(game => {
//                         return game.team1.team_id == teamid || game.team2.team_id == teamid;
//                     });
//                     if (gamesWithTeam.length > 0) {
//                         return callback(null, {teamID : teamid, removed : false});
//                     }
//                     break;
//                 }
//             }
//             Tournament.update({_id : tournamentid}, {$pull : {players : {teamID : teamid}}}, err => {
//                 if (err) {
//                     callback(err);
//                 } else {
//                     Tournament.update({_id : tournamentid}, {$pull : {teams : {_id : teamid}}}, err => {
//                         if (err) {
//                             callback(err);
//                         } else {
//                             callback(null, {teamID : teamid, removed : true});
//                         }
//                     });
//                 }
//             });
//         }
//     });
// }

// /**
// * Updates a team's name, division, and player's teamname
// * @param tournamentid id of the tournament to update
// * @param teamid id of the team to update
// * @param newinfo new information about the team
// * @param callback function called back with an error (or null) and the team's
// * new name
// */
// function updateTeam(tournamentid, teamid, newinfo, callback) {
//     Tournament.findOne({_id : tournamentid}, (err, result) => {
//         if (err) {
//             console.log(err);
//             return callback(err);
//         } else {
//             for (let i = 0; i < result.teams.length; i++) {
//                 if (result.teams[i].team_name == newinfo.teamName
//                         && result.teams[i]._id != newinfo.teamID) {
//                     return callback(null, null);
//                 }
//             }
//             Tournament.update({_id : tournamentid, "teams._id" : newinfo.teamID},
//                         {"$set" : {"teams.$.team_name" : newinfo.teamName, "teams.$.divisions" : newinfo.divisions || {}}},
//                     err => {
//                         if (err) {
//                             console.log(err);
//                             return callback(err);
//                         } else {
//                             return callback(null, newinfo.teamName);
//                         }
//                     });
//                 }
//             });
// }

// /**
// * Updates a player in a tournament given a tournamentID, playerID, and
// * a new player name.
// * @param tournamentID id of the tournament to update a player in
// * @param playerID id of the player to edit
// * @param newPlayerName new name of the player
// * @param callback callback function called with an error (or null)
// */
// function updatePlayer(tournamentID, playerID, newPlayerName, callback) {
//     Tournament.update({_id : tournamentID, "players._id" : playerID},
//             {"$set" : {"players.$.player_name" : newPlayerName}}, err => {
//                 callback(err);
//             });
// }

// /**
// * Removes a player from a tournament given a tournamentid, playerid and a
// * callback function
// * @param tournamentID id of the tournament to remove a player from
// * @param playerID id of the player to remove
// * @param callback callback called with an error or null
// */
// function removePlayer(tournamentID, playerID, callback) {
//     const tournamentQuery = {_id : tournamentID, "players._id" : playerID};
//     const pullQuery = {$pull : {players : {_id : playerID}}};
//     Tournament.update(tournamentQuery, pullQuery, err => {
//         callback(err);
//     });
// }

// /**
// *  Adds a player to a tournament given a tournament id, team name, team id, and a
// * player name
// * @param tournamentID id of the tournament to add a player to
// * @param teamName name of the team
// * @param teamID id of the team to link a player and team
// * @param playerName name of the new player
// * @param callback callback function with the new player and the tournament's point scheme
// */
// function addPlayer(tournamentID, teamName, teamID, playerName, callback) {
//     const tournamentQuery = {_id : tournamentID};
//     const newPlayer = new Player({
//         player_name : playerName,
//         teamID : teamID
//     });
//     newPlayer.shortID = shortid.generate();
//     Tournament.findOne(tournamentQuery, (err, result) => {
//         if (!result) {
//             callback(err, null);
//         } else {
//             newPlayer.pointValues = result.pointScheme;
//             const pushQuery = {$push : {players : newPlayer}};
//             Tournament.update(tournamentQuery, pushQuery, err => {
//                 if (err) {
//                     callback(err);
//                 } else {
//                     callback(null, newPlayer, result.pointScheme, result.pointsTypes);
//                 }
//             });
//         }
//     });
// }

// /**
// * Changes a game's short ID back to the original after a game is deleted and needs to
// * be updated with a new id
// * @param tournamentid id of the tournament to change a game short id in
// * @param currentID current shortID of the game
// * @param newID new id of the game to revert back to
// * @param callback callback function with an error (or null)
// */
// function changeGameShortID(tournamentid, currentID, newID, callback) {
//     Tournament.update({_id : tournamentid, "games.shortID" : currentID},
//             {"$set" : {"games.$.shortID" : newID}}, err => {
//                 callback(err);
//             });
// }

// /**
// * Changes a tournament's point scheme
// * @param tournamentid id of the tournament to change point scheme of
// * @param newPointScheme new point scheme
// * @param newPointTypes value of each point type
// * @param callback callback function with error (or null)
// */
// function changePointScheme(tournamentid, newPointScheme, newPointTypes, callback) {
//     Tournament.update({_id : tournamentid},
//             {"$set" : {pointScheme : newPointScheme, pointsTypes : newPointTypes}}, err => {
//                 if (err) {
//                     console.log(err);
//                 }
//                 callback(err);
//             });
// }

// /**
// * Updates a tournament's divisions
// * @param tournamentid id of tournament to update divisions of
// * @param divisions array of new divisions
// * @param callback callback function with an error (or null)
// */
// function updateDivisions(tournamentid, divisions, callback) {
//     Tournament.update({_id : tournamentid},
//             {"$set" : {divisions : divisions}}, err => {
//                 if (err) {
//                     callback(err);
//                 } else {
//                     Tournament.findOne({_id : tournamentid}, {divisions : 1}, (err, tournament) => {
//                         if (err) {
//                             callback(err);
//                         } else {
//                             tournament.divisions.sort((first, second) => {
//                                 if (first.phase_id === second.phase_id) {
//                                     return first.name.localeCompare(second.name);
//                                 } else {
//                                     return first.phase_id.localeCompare(second.phase_id);
//                                 }
//                             });
//                             callback(err, tournament.divisions);
//                         }
//                     });
//                 }
//             });
// }

// /**
// * Updates general information about a tournament
// * @param tournamentid id of the tournament to update
// * @param information new information about the tournament
// * @param callback callback with an error (or null)
// */
// function updateTournamentInformation(tournamentid, information, directorid, callback) {
//     Tournament.findOne({_id : tournamentid}, {directorid : 1, collaborators : 1}, (err, result) => {
//         if (err) {
//             callback(err);
//         } else if (!result) {
//             callback(null, null);
//         } else {
//             let filtered = result.collaborators.filter(collab => {
//                 return collab._id == directorid;
//             });
//             if (result.directorid == directorid || filtered.length > 0) {
//                 Tournament.update({_id : tournamentid},
//                         {"$set" : {tournament_name : information.tournament_name, location : information.tournament_location,
//                                 date : information.tournament_date, description : information.tournament_description,
//                                     questionSet : information.tournament_qset, hidden : information.hidden || false}}, err => {
//                                     callback(err, null);
//                                 });
//             } else {
//                 callback(null, "Unauthorized");
//             }
//         }
//     });
// }

// /**
// * Finds tournament collaborators given a search query
// * @param query search query of collaborators to add
// * @param callback callback with an array of directors found matching the query
// */
// function findDirectors(query, callback) {
//     query = query.trim();
//     try {
//         const rex = new RegExp(".*" + query + ".*", "i");
//         const finalQuery = {$and : [{visible : true}, {$or : [{email : rex}, {name : rex}]}]};
//         TournamentDirector.find(finalQuery, (err, directors) => {
//             if (err) {
//                 console.log(err);
//                 callback(err);
//             } else {
//                 directors.sort((first, second) => {
//                     return first.name.localeCompare(second.name);
//                 });
//                 callback(null, directors);
//             }
//         });
//     } catch (exception) {
//         console.log(exception);
//         callback(exception, []);
//     }
// }

// /**
// * Add a collaborator to a tournament if not already a collaborator in the
// * tournament
// * @param tournamentid id of the tournament to add collaborator to
// * @param collaborator collaborator to add
// * @param callback with an error or (null) and a boolean representing if collaborator
// * already existed before-hand
// */
// function addCollaborator(tournamentid, collaborator, callback) {
//     Tournament.findOne({shortID : tournamentid}, (err, tournament) => {
//         if (err) {
//             callback(err);
//         } else if (tournament) {
//             for (let j = 0; j < tournament.collaborators.length; j++) {
//                 if (tournament.collaborators[j].id == collaborator.id || collaborator.id == tournament.directorid) {
//                     return callback(null, true);
//                 }
//             }
//             Tournament.update({shortID : tournamentid}, {$push : {collaborators : collaborator}}, err => {
//                 return callback(err, false);
//             });
//         } else {
//             callback(null, false);
//         }
//     });
// }

// /**
// * Removes a collaborator from a tournament
// * @param tournamentid id of the tournament to remove collaborator from
// * @param collaboratorid id of collaborator
// * @param callback callback with an error (or null)
// */
// function removeCollaborator(tournamentid, collaboratorid, callback) {
//     Tournament.update({shortID : tournamentid}, {$pull : {collaborators : {id : collaboratorid}}}, err => {
//         callback(err);
//     });
// }

// /**
// * Finds all a tournament's collaborators
// * @param tournamentid id of the tournament to get collaborators from
// * @param callback callback function with an array of collaborators
// */
// function findCollaborators(tournamentid, callback) {
//     Tournament.findOne({shortID : tournamentid}, {collaborators : 1}, (err, result) => {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else {
//             callback(null, result.collaborators);
//         }
//     });
// }

// /**
// * Adds a subsmitted scoresheet as a game
// * @param tournamentid id of the tournament to add game to
// * @param scoresheet scoresheet to add
// * @param callback callback with the new game's shortID
// */
// function addScoresheetAsGame(tournamentid, game, scoresheet, callback) {
//     const newGame = new Game();
//     newGame.team1 = game.team1;
//     newGame.team2 = game.team2;
//     newGame.round = game.round;
//     newGame.tossupsheard = game.tossupsheard;
//     newGame.room = game.room;
//     newGame.moderator = game.moderator;
//     newGame.packet = game.packet;
//     newGame.notes = game.notes;
//     newGame.phase_id = game.phase_id;
//     newGame.phases = !scoresheet.phases ? [] : scoresheet.phases;
//     newGame.shortID = shortid.generate();
//     for (let i = 0; i < newGame.phases.length; i++) {
//         if (!newGame.phases[i].tossup) {
//             newGame.phases[i].tossup = {answers : []};
//         }
//         if (!newGame.phases[i].bonus.bonusParts) {
//             newGame.phases[i].bonus.bonusParts = [];
//         }
//     }
//     Tournament.update({_id : tournamentid}, {$push : {games : newGame}}, err => {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else {
//             callback(null, newGame.shortID);
//         }
//     });
// }

// /**
// * Clones a tournament as a new phase. Has same teams and players as given tournamentid
// * @param tournamentid id of the tournament to clone
// * @param phaseName name of the new tournament
// * @param callback callback function with new tournament id and an error (or null)
// */
// function cloneTournament(tournamentid, phaseName, callback) {
//     Tournament.findOne({_id : tournamentid}, (err, tournament) => {
//         if (err) {
//             callback(err, null);
//         } else if (!tournament) {
//             callback(null, null);
//         } else {
//             const newTournament = new Tournament();
//             newTournament.tournament_name = phaseName;
//             newTournament.shortID = shortid.generate();
//             newTournament.teams = tournament.teams;
//             newTournament.players = tournament.players;
//             newTournament.directorid = tournament.directorid;
//             newTournament.collaborators = tournament.collaborators;
//             newTournament.location = tournament.location;
//             newTournament.date = tournament.date;
//             newTournament.questionSet = tournament.questionSet;
//             newTournament.description = tournament.description;
//             newTournament.pointScheme = tournament.pointScheme;
//             newTournament.pointsTypes = tournament.pointsTypes;

//             newTournament.save(err => {
//                 if (err) {
//                     console.log(err);
//                     return callback(err);
//                 }
//                 callback(null, newTournament.shortID);
//             });
//         }
//     });
// }

// function newPhase(tournamentid, phaseName, callback) {
//     const phase = {phase_id : shortid.generate(), name : phaseName};
//     Tournament.update({_id : tournamentid}, {$push : {phases : phase}}, err => {
//         callback(err, phase);
//     });
// }

// function removePhase(tournamentid, phaseID, directorid, callback) {
//     Tournament.findOne({shortID : tournamentid}, {directorid : 1, phases : 1, games : 1}, (err, tournament) => {
//         if (err) {
//             return callback(err);
//         } else if (!tournament) {
//             return callback(null, null, null);
//         } else if (tournament.directorid != directorid) {
//             return callback(null, 'unauthorized', null);
//         } else {
//             if (tournament.phases.length === 1) {
//                 return callback(null, null, false);
//             }
//             for (let i = 0; i < tournament.games.length; i++) {
//                 if (tournament.games[i].phase_id.indexOf(phaseID) != -1) {
//                     return callback(null, null, false);
//                 }
//             }
//             Tournament.update({_id : tournament._id}, {$pull : {phases : {phase_id : phaseID}}}, err => {
//                 return callback(err, null, true);
//             });
//         }
//     });
// }

// function switchPhases(tournamentid, phaseID, directorid, callback) {
//     Tournament.findOne({shortID : tournamentid}, {directorid : 1, phases : 1}, (err, tournament) => {
//         if (err) {
//             return callback(err);
//         } else if (!tournament) {
//             return callback(null, null, false);
//         } else if (tournament.directorid != directorid) {
//             return callback(null, 'unauthorized', false);
//         } else {
//             let newPhases = [];
//             tournament.phases.forEach(phase => {
//                 let phaseObj = {phase_id : phase.phase_id, name : phase.name, active : false};
//                 if (phaseObj.phase_id == phaseID) {
//                     phaseObj.active = true;
//                 }
//                 newPhases.push(phaseObj);
//             });
//             Tournament.update({_id : tournament._id}, {$set : {phases : newPhases}}, err => {
//                 callback(err, null, true);
//             });
//         }
//     });
// }

// function editPhases(tournamentid, directorid, newPhases, callback) {
//     Tournament.findOne({shortID : tournamentid}, {directorid : 1}, (err, tournament) => {
//         if (err) {
//             return callback(err);
//         } else if (!tournament) {
//             return callback(null, null, null);
//         } else if (tournament.directorid != directorid) {
//             return callback(null, "unauthorized", null);
//         } else {
//             Tournament.update({shortID : tournamentid}, {$set : {phases : newPhases}}, err => {
//                 if (err) {
//                     return callback(err);
//                 } else {
//                     Tournament.findOne({shortID : tournamentid}, {games : 1, teams : 1, shortID : 1, directorid : 1, phases : 1}, (err, result) => {
//                         if (err) {
//                             return callback(err);
//                         } else {
//                             return callback(err, null, result);
//                         }
//                     });
//                 }
//             });
//         }
//     });
// }

// /**
// * Merges two tournaments together given their ids and a name for the resultant
// * tournament.
// * @param firstTournamentID id of first tournament
// * @param secondTournamentID id of the second tournament
// * @param name name of the new tournament
// * @param callback callback with the new tournament (or null if error) and an error (or null)
// */
// function mergeTournaments(firstTournamentID, secondTournamentID, name, callback) {
//     const mergedTourney = new Tournament();
//     mergedTourney.tournament_name = name;
//     mergedTourney.shortID = shortid.generate();
//     mergedTourney.teams = [];
//     mergedTourney.players = [];
//     mergedTourney.games = [];
//     Tournament.findOne({_id : firstTournamentID}, (err, first) => {
//         if (err) {
//             console.log(err);
//             callback(err);
//         } else if (!first) {
//             callback(null, null);
//         } else {
//             mergedTourney.teams = first.teams;
//             mergedTourney.players = first.players;
//             mergedTourney.divisions = first.divisions;
//             mergedTourney.games = mergedTourney.games.concat(first.games);
//             mergedTourney.collaborators = first.collaborators;
//             const date = new Date(first.date);
//             mergedTourney.date = date;
//             mergedTourney.location = first.location;
//             mergedTourney.directorid = first.directorid;
//             mergedTourney.questionSet = first.questionSet;
//             mergedTourney.description = first.description;
//             mergedTourney.pointsTypes = first.pointsTypes;
//             mergedTourney.pointScheme = first.pointScheme;

//             Tournament.findOne({_id : secondTournamentID}, (err, second) => {
//                 if (err) {
//                     console.log(err);
//                     callback(err);
//                 } else if (!second) {
//                     callback(null, null);
//                 } else {
//                     mergedTourney.games = mergedTourney.games.concat(second.games);
//                     const existingTeams = {};
//                     const existingPlayers = {};
//                     mergedTourney.teams.forEach(team => {
//                         existingTeams[team._id] = true;
//                     });
//                     mergedTourney.players.forEach(player => {
//                         existingPlayers[player._id] = true;
//                     });
//                     second.teams.forEach(team => {
//                         if (!existingTeams[team._id]) {
//                             mergedTourney.teams.push(team);
//                         }
//                     });
//                     second.players.forEach(player => {
//                         if (!existingPlayers[player._id]) {
//                             mergedTourney.players.push(player);
//                         }
//                     });
//                     mergedTourney.save(err => {
//                         if (err) {
//                             console.log(err);
//                             return callback(err);
//                         }
//                         callback(err, mergedTourney);
//                     });
//                 }
//             });
//         }
//     });
// }



// /**
// * Deletes a tournament from the database
// * @param directorid id of the logged in director
// * @param tournamentid id of the tournament to delete
// * @param callback callback with an error (or null) and indication of success
// */
// function deleteTournament(directorid, tournamentid, callback) {
//     Tournament.findOne({_id : tournamentid}, (err, tournament) => {
//         if (err) {
//             callback(err, null);
//         } else if (!tournament) {
//             callback('not found', null);
//         } else if (tournament.directorid == directorid) {
//             Tournament.remove({_id : tournamentid}, err => {
//                 if (err) {
//                     callback(err);
//                 } else {
//                     callback(null, null);
//                 }
//             });
//         } else {
//             callback(null, "Unauthorized");
//         }
//     });
// }

// exports.addTournament = addTournament;
// exports.findTournamentsByDirector = findTournamentsByDirector;
// exports.findTournamentById = findTournamentById;
// exports.getTeams = getTeams;
// exports.getGames = getGames;
// exports.addTeamToTournament = addTeamToTournament;
// exports.findTeamMembers = findTeamMembers;
// exports.addGameToTournament = addGameToTournament;
// exports.removeGameFromTournament = removeGameFromTournament;
// exports.changeGameShortID = changeGameShortID;
// exports.removeTeamFromTournament = removeTeamFromTournament;
// exports.updateTeam = updateTeam;
// exports.findDirectors = findDirectors;
// exports.updatePlayer = updatePlayer;
// exports.removePlayer = removePlayer;
// exports.addPlayer = addPlayer;
// exports.changePointScheme = changePointScheme;
// exports.updateDivisions = updateDivisions;
// exports.updateTournamentInformation = updateTournamentInformation;
// exports.addCollaborator = addCollaborator;
// exports.findCollaborators = findCollaborators;
// exports.removeCollaborator = removeCollaborator;
// exports.addScoresheetAsGame = addScoresheetAsGame;
// exports.cloneTournament = cloneTournament;
// exports.mergeTournaments = mergeTournaments;
// exports.deleteTournament = deleteTournament;
// exports.loadTournamentScoresheet = loadTournamentScoresheet;
// exports.newPhase = newPhase;
// exports.removePhase = removePhase;
// exports.switchPhases = switchPhases;
// exports.editPhases = editPhases;
