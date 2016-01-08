var mongoose = require("mongoose");
var Tournament = mongoose.model("Tournament");

var SCHEMA_VERSION = "1.1";

/**
* Responsible for gathering basic statistics information about a tournament's teams
* and calling the given callback with an err if needed, the tournament found, and
* the array of team statistics
* @param tournamentid id of the tournament to get team statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of team statistics
*/
function getTeamsInfo(tournamentid, callback) {
    var teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {

        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            for (var i = 0; i < result.teams.length; i++) {
                teamInfo.push(result.teams[i].getAverageInformation(result));
            }
            // console.log(teamInfo);
            teamInfo.sort(function(first, second) {
                if (second.stats["Win %"] == first.stats["Win %"]) {
                    if (second.stats["PPG"] == first.stats["PPG"]) {
                        return second.stats["PPB"] - first.stats["PPB"];
                    }
                    return second.stats["PPG"] - first.stats["PPG"];
                } else {
                    return second.stats["Win %"] - first.stats["Win %"];
                }
            });
            for (var i = 0; i < teamInfo.length; i++) {
                teamInfo[i].stats["Rank"] = i + 1;
            }
            // console.log(teamInfo);
            callback(null, result, teamInfo);
        }
    });
}

/**
* Responsible for gathering statistics information given constraints about a tournament's teams
* and calling the given callback with an err if needed, the tournament found, and
* the array of team statistics
* @param tournamentid id of the tournament to get team statistics from
* @param constraints limits on the teams to get, min and max round
* @param callback asynchronous callback function called after this function is done with the
* list of team statistics
*/
function getFilteredTeamsInformation(tournamentid, constraints, callback) {
    // console.log(constraints);
    var teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, [])
        } else {
            if (constraints.teams) {
                for (var i = 0; i < result.teams.length; i++) {
                    if (constraints.teams.indexOf(result.teams[i]._id.toString()) != -1) {
                        teamInfo.push(result.teams[i].getAverageInformationFiltered(result, constraints));
                    }
                }
            } else {
                for (var i = 0; i < result.teams.length; i++) {
                    teamInfo.push(result.teams[i].getAverageInformationFiltered(result, constraints));
                }
            }
            teamInfo.sort(function(first, second) {
                if (second.stats["Win %"] == first.stats["Win %"]) {
                    if (second.stats["PPG"] == first.stats["PPG"]) {
                        return second.stats["PPB"] - first.stats["PPB"];
                    }
                    return second.stats["PPG"] - first.stats["PPG"];
                } else {
                    return second.stats["Win %"] - first.stats["Win %"];
                }
            });
            callback(null, result, teamInfo);
        }
    });

}

/**
* Responsible for gathering basic statistics information about a tournament's players
* and calling the given callback with an err if needed, the tournament found, and
* the array of player statistics
* @param tournamentid id of the tournament to get player statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of player statistics
*/
function getPlayersInfo(tournamentid, callback) {
    var playersInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            for (var i = 0; i < result.players.length; i++) {
                playersInfo.push(result.players[i].getAllInformation(result));
            }
            playersInfo.sort(function(first, second) {
                return second.stats["PPG"] - first.stats["PPG"];
            });
            callback(null, result, playersInfo);
        }
    });
}

/**
* Responsible for gathering statistics information about a tournament's players given a set of constraints
* and calling the given callback with an err if needed, the tournament found, and
* the array of player statistics
* @param tournamentid id of the tournament to get player statistics from
* @param constraints  constraints on teams, and min and max round
* @param callback asynchronous callback function called after this function is done with the
* list of player statistics
*/
function getFilteredPlayersInformation(tournamentid, constraints, callback) {
    var playersInfo = [];
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            if (constraints.teams) {
                for (var i = 0; i < result.players.length; i++) {
                    if (constraints.teams.indexOf(result.players[i].teamID) != -1) {
                        playersInfo.push(result.players[i].getAllInformationFiltered(result, constraints));
                    }
                }
            } else {
                for (var i = 0; i < result.players.length; i++) {
                    playersInfo.push(result.players[i].getAllInformationFiltered(result, constraints));
                }
            }
            playersInfo.sort(function(first, second) {
                return second.stats["PPG"] - first.stats["PPG"];
            });
            callback(null, result, playersInfo);
        }
    });
}

/**
* Responsible for gathering full statistics information about a tournament's teams
* and calling the given callback with an err if needed, the tournament found, and
* the array of team statistics
* @param tournamentid id of the tournament to get team statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of team statistics
*/
function getFullTeamsGameInformation(tournamentid, callback) {
    var teamsInfo = {};
    var playersInfo = {};
    var teamTotals = {};
    Tournament.findOne({shortID : tournamentid}, function(err, result) {
        if (err) {
            callback(err, null, {}, {});
        } else if (result == null) {
            callback(null, null, {}, {});
        } else {
            for (var i = 0; i < result.teams.length; i++) {
                teamsInfo[result.teams[i].shortID] = {team : result.teams[i].team_name, games : result.teams[i].getAllGamesInformation(result)};
                playersInfo[result.teams[i].shortID] = {team : result.teams[i].team_name, stats : result.teams[i].getPlayerStats(result)};
                teamTotals[result.teams[i].shortID] = {team : result.teams[i].team_name, stats : result.teams[i].getTotalGameStats(result)};
            }
            callback(null, result, teamsInfo, playersInfo, teamTotals);
        }
    });
}

/**
* Responsible for gathering full statistics information about a tournament's players
* and calling the given callback with an err if needed, the tournament found, and
* the array of player statistics
* @param tournamentid id of the tournament to get player statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of player statistics
*/
function getFullPlayersGameInformation(tournamentid, callback) {
    var playersInfo = {};
    var playerTotals = {};
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null, {}, {});
        } else if (tournament == null) {
            callback(null, null, {}, {});
        } else {
            for (var i = 0; i < tournament.players.length; i++) {
                playersInfo[tournament.players[i].shortID] = {name : tournament.players[i].player_name, team : tournament.players[i].team_name, games : tournament.players[i].getAllGamesInformation(tournament)};
                playerTotals[tournament.players[i].shortID] = tournament.players[i].getTotalGameStats(tournament);
            }
            callback(null, tournament, playersInfo, playerTotals);
        }
    });
}

/**
* Gets round report information
* @param tournamentid id of the tournament to get round averages from
* @param callback callback function with an error (or null), tournament name, and the rounds information
*/
function getRoundReport(tournamentid, callback) {
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null, null);
        } else if (!tournament) {
            callback(null, null, null);
        } else {
            var gameRounds = {};
            for (var i = 0; i < tournament.games.length; i++) {
                var round = tournament.games[i].round;
                if (!gameRounds[round]) {
                    gameRounds[round] = [];
                }
                gameRounds[round].push(tournament.games[i]);
            }
            var roundAverages = {};
            var rounds = Object.keys(gameRounds);
            for (var i = 0; i < rounds.length; i++) {
                roundAverages[rounds[i]] = {};
                roundAverages[rounds[i]]["PPG/Team"] = getRoundPPG(gameRounds[rounds[i]]);
                roundAverages[rounds[i]]["TUPts/TUH"] = getRoundTUPts(gameRounds[rounds[i]], tournament.pointScheme);
                roundAverages[rounds[i]]["PPB"] = getPPBForRounds(gameRounds[rounds[i]], tournament.pointScheme, tournament.pointsTypes);
            }
            callback(null, tournament, roundAverages);
        }
    });
}

/**
* Returns the PPG for a round
* @param games array of games to parse
* @return round ppg
*/
function getRoundPPG(games) {
    var totalPoints = 0;
    var totalTeams = 0;
    for (var i = 0; i < games.length; i++) {
        var currentGame = games[i];
        if (currentGame.team1) {
            totalPoints += currentGame.team1.score;
            totalTeams++;
        }
        if (currentGame.team2) {
            totalPoints += currentGame.team2.score;
            totalTeams++;
        }
    }
    return +(totalPoints / totalTeams).toFixed(2);
}

/**
* Gets average TUPts/TUH
* @param games array of games to parse
* @param pointScheme point values used in tournament
* @return average TUPts/TUH
*/
function getRoundTUPts(games, pointScheme) {
    var pointTypes = Object.keys(pointScheme);
    // console.log(pointTypes);
    var totalTossupsHeard = 0;
    var tossupPoints = 0;
    for (var i = 0; i < games.length; i++) {
        totalTossupsHeard +=  games[i].tossupsheard;
        if (games[i].team1 && games[i].team1.playerStats) {
            for (var player in games[i].team1.playerStats) {
                if (games[i].team1.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team1.playerStats[player];
                    // console.log(player);
                    for (var j = 0; j < pointTypes.length; j++) {
                        if (stats[pointTypes[j]]) {
                            // console.log(parseFloat(pointTypes[j]));
                            // console.log(parseFloat(stats[pointTypes[j]]));
                            // console.log(stats[pointTypes[j]]);
                            var total = parseFloat(pointTypes[j]) * parseFloat(stats[pointTypes[j]]);
                            // console.log(total);
                            tossupPoints += total;
                        }
                    }
                }
            }
        }
        if (games[i].team2 && games[i].team2.playerStats) {
            for (var player in games[i].team2.playerStats) {
                if (games[i].team2.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team2.playerStats[player];
                    // console.log(player);
                    for (var j = 0; j < pointTypes.length; j++) {
                        if (stats[pointTypes[j]]) {
                            var total = parseFloat(pointTypes[j]) * parseFloat(stats[pointTypes[j]]);
                            tossupPoints += total;
                        }
                    }
                }
            }
        }
    }
    // console.log(tossupPoints);
    return +(tossupPoints / totalTossupsHeard).toFixed(2);
}

/**
* Returns average bonus points for a round's games
* @param games games for one round
* @param pointScheme point value used in tournament
* @param pointTypes type of each point value
* @return average ppb for a round's games
*/
function getPPBForRounds(games, pointScheme, pointTypes) {
    var totalBonusPoints = 0;
    var totalTossupsGotten = 0;
    var pointKeys = Object.keys(pointScheme);

    for (var i = 0; i < games.length; i++) {
        if (games[i].team1 && games[i].team1.playerStats) {
            var bonusPoints = games[i].team1.score - games[i].team1.bouncebacks;
            for (var player in games[i].team1.playerStats) {
                if (games[i].team1.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team1.playerStats[player];
                    // console.log(player);
                    for (var j = 0; j < pointKeys.length; j++) {
                        // console.log(stats[pointKeys[j]]);
                        if (pointTypes[pointKeys[j]] != "N" && stats[pointKeys[j]]) {
                            totalTossupsGotten += parseFloat(stats[pointKeys[j]]);
                        }
                        if (stats[pointKeys[j]]) {
                            bonusPoints -= parseFloat(stats[pointKeys[j]]) * parseFloat(pointKeys[j]);
                        }
                    }
                }
            }
            totalBonusPoints += bonusPoints;
        }
        if (games[i].team2 && games[i].team2.playerStats) {
            var bonusPoints = games[i].team2.score - games[i].team2.bouncebacks;
            for (var player in games[i].team2.playerStats) {
                if (games[i].team2.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team2.playerStats[player];
                    // console.log(player);
                    for (var j = 0; j < pointKeys.length; j++) {
                        // console.log(stats[pointKeys[j]]);
                        if (pointTypes[pointKeys[j]] != "N" && stats[pointKeys[j]]) {
                            totalTossupsGotten += parseFloat(stats[pointKeys[j]]);
                        }
                        if (stats[pointKeys[j]]) {
                            bonusPoints -= parseFloat(stats[pointKeys[j]]) * parseFloat(pointKeys[j]);
                        }
                    }
                }
            }
            totalBonusPoints += bonusPoints;
        }
    }
    // console.log(totalTossupsGotten);
    return totalTossupsGotten == 0 ? 0 : +(totalBonusPoints / totalTossupsGotten).toFixed(2);
}

/**
* Converts a tournament from the Mongo database to an SQBS readable format
* For more information on the SQBS format, visit : https://code.google.com/p/qbsql/source/browse/trunk/functions.php#504
* @param tournamentid id of the tournament to convert
* @param callback callback function with an error (or null) and the sqbs string
*/
function convertToSQBS(tournamentid, callback) {
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null);
        } else if (!tournament) {
            callback(null, null);
        } else {
            var sqbsString = "";
            sqbsString += tournament.teams.length + "\n";
            // Build the team map
            var teamMap = {};
            var teamIndex = 0;
            for (var i = 0; i < tournament.teams.length; i++) {
                teamMap[tournament.teams[i]._id] = {team_name : tournament.teams[i].team_name, players : [], team_index : teamIndex};
                teamIndex++;
            }
            // console.log(teamMap);
            for (var i = 0; i < tournament.players.length; i++) {
                var numPlayers = teamMap[tournament.players[i].teamID].players.length;
                teamMap[tournament.players[i].teamID].players.push({name : tournament.players[i].player_name, id : tournament.players[i]._id, player_index : numPlayers});
                // console.log(teamMap[tournament.players[i].teamID].players);
            }
            // console.log(JSON.stringify(teamMap, null, 4));
            for (var team in teamMap) {
                if (teamMap.hasOwnProperty(team)) {
                    sqbsString += (teamMap[team].players.length + 1) + "\n";
                    sqbsString += teamMap[team].team_name + "\n";
                    for (var i = 0; i < teamMap[team].players.length; i++) {
                        sqbsString += teamMap[team].players[i].name + "\n";
                    }
                }
            }
            sqbsString += tournament.games.length + "\n";
            for (var i = 0; i < tournament.games.length; i++) {
                sqbsString += i + "\n";
                var currentGame = tournament.games[i];
                // console.log(teamMap[currentGame.team1.team_id].team_index);
                // console.log(teamMap[currentGame.team2.team_id].team_index);
                sqbsString += teamMap[currentGame.team1.team_id].team_index + "\n";
                sqbsString += teamMap[currentGame.team2.team_id].team_index + "\n";
                sqbsString += currentGame.team1.score + "\n";
                sqbsString += currentGame.team2.score + "\n";
                sqbsString += currentGame.tossupsheard + "\n";
                sqbsString += currentGame.round + "\n";
                sqbsString += "3\n";
                sqbsString += "200\n";
                sqbsString += "5\n";
                sqbsString += "110\n";
                sqbsString += "0\n";
                sqbsString += "0\n";
                sqbsString += "0\n";
                sqbsString += "0\n";
                sqbsString += "0\n";
                sqbsString += "0\n";
                // sqbsString += "----------Start Player Stats ----------------\n";
                var current = 0;
                for (var player in currentGame.team1.playerStats) {
                    if (currentGame.team1.playerStats.hasOwnProperty(player)) {
                        // console.log(player);
                        // console.log(player);
                        var index = -1;
                        // console.log(teamMap[currentGame.team1.team_id].players);
                        // console.log("num players: " + teamMap[currentGame.team1.team_id].players.length);
                        for (var j = 0; j < teamMap[currentGame.team1.team_id].players.length; j++) {
                            if (player == teamMap[currentGame.team1.team_id].players[j].id) {
                                // console.log("match");
                                index = teamMap[currentGame.team1.team_id].players[j].player_index;
                                break;
                            }
                        }
                        // console.log(index);
                        sqbsString += index + "\n0\n0\n0\n0\n0\n0\n";
                        // sqbsString += "----------Next Player---------\n";
                        current++;
                    }
                }
                while (current < 7) {
                    sqbsString += "-1\n0\n0\n0\n0\n0\n0\n";
                    current++;
                    // sqbsString += "------------Next Player----------\n";
                }
                // sqbsString += "--------Next Team ---------\n";
                // console.log(current);
                current = 0;
                for (var player in currentGame.team2.playerStats) {
                    if (currentGame.team2.playerStats.hasOwnProperty(player)) {
                        // console.log(player);
                        // console.log(player);
                        var index = -1;
                        // console.log(teamMap[currentGame.team1.team_id].players);
                        // console.log("num players: " + teamMap[currentGame.team2.team_id].players.length);
                        for (var j = 0; j < teamMap[currentGame.team2.team_id].players.length; j++) {
                            if (player == teamMap[currentGame.team2.team_id].players[j].id) {
                                // console.log("match");
                                index = teamMap[currentGame.team2.team_id].players[j].player_index;
                                break;
                            }
                        }
                        // console.log(index);
                        sqbsString += index + "\n0\n0\n0\n0\n0\n0\n";
                        // sqbsString += "----------Next Player---------\n";
                        current++;
                    }
                }
                while (current < 7) {
                    sqbsString += "-1\n0\n0\n0\n0\n0\n0\n";
                    current++;
                    // sqbsString += "------------Next Player----------\n";
                }
                // console.log(current);
            }
            sqbsString = sqbsString.replace(/\n$/, "")
            callback(null, sqbsString);
        }
    });
}

/**
* Converts a tournament from the way it's saved in the Mongo database to the
* QBJ format
* @param tournamentid id of the tournament to convert
* @param callback callback function with an error (Or null) and the quizbowlSchema object
*/
function convertToQuizbowlSchema(tournamentid, callback) {
    Tournament.findOne({shortID : tournamentid}, function(err, tournament) {
        if (err) {
            callback(err, null);
        } else if (!tournament) {
            callback(null, null);
        } else {
            var qbjObj = {version : SCHEMA_VERSION, objects : []};
            var tournamentObject = {matches : [], registrations : [], type : "Tournament", name : tournament.tournament_name};
            var teamMap = {};
            for (var i = 0; i < tournament.teams.length; i++) {
                teamMap[tournament.teams[i]._id] = {id : "team_" + tournament.teams[i].shortID,
                    name : tournament.teams[i].team_name, players : [], shortID : tournament.teams[i].shortID};
                tournamentObject.registrations.push({$ref : "school_" + tournament.teams[i].shortID});
            }
            for (var i = 0; i < tournament.players.length; i++) {
                var teamid = tournament.players[i].teamID;
                var playerObj = {id : "player_" + tournament.players[i].shortID, name : tournament.players[i].player_name};
                teamMap[teamid].players.push(playerObj);
                // console.log(playerObj);
            }
            for (var teamid in teamMap) {
                if (teamMap.hasOwnProperty(teamid)) {
                    var teamObj = {type : "Registration"};
                    teamObj.id = "school_" + teamMap[teamid].shortID;
                    // teamObj.id = "school_" + teamMap[teamid].id;
                    teamObj.name = teamMap[teamid].name;
                    teamObj.teams = [];
                    var newTeam = {id : teamMap[teamid].id, name : teamMap[teamid].name, players : teamMap[teamid].players};
                    teamObj.teams.push(newTeam);
                    qbjObj.objects.push(teamObj);
                }
            }
            var playerMap = makePlayerMap(tournament.players);
            for (var i = 0; i < tournament.games.length; i++) {
                tournamentObject.matches.push({$ref : "game_" + tournament.games[i].shortID});
                qbjObj.objects.push(makeGameObject(tournament.games[i], teamMap, playerMap, Object.keys(tournament.pointScheme)));
            }
            // console.log(teamMap);
            qbjObj.objects.push(tournamentObject);
            callback(null, qbjObj);
        }
    });
}

/**
* Creates a map of all players in a given tournament where the key is the player's id
* and the value is the player's shortID and name
* @param players array of players
* @return map of all players
*/
function makePlayerMap(players) {
    var playerMap = {};
    for (var i = 0; i < players.length; i++) {
        playerMap[players[i]._id] = {shortID : players[i].shortID, name : players[i].player_name};
    }
    return playerMap;
}

/**
* Creates a game object adhering to the .qbj format
* @param game game to convert
* @param teamMap a map of teams where key is the teamid and the values are the team's name
* and shortID
* @param playerMap map of players where key is playerid and values are player's name and shortID
* @param pointScheme tournament's point scheme so that only relevant point values are factored in
* @return a game object adhering to .qbj format
*/
function makeGameObject(game, teamMap, playerMap, pointScheme) {
    var gameObject = {id : "game_" + game.shortID, location : game.room,
        match_teams : [], match_questions : [], round : game.round, tossups : game.tossupsheard, type : "Match",
        moderator : game.moderator, notes : game.notes};

    var numPlayersTeam1 = Object.keys(game.team1.playerStats).length;
    var numPlayersTeam2 = Object.keys(game.team2.playerStats).length;

    var firstTeamObj = {match_players : [], team : {$ref : "team_" + teamMap[game.team1.team_id].shortID}};
    if (numPlayersTeam1 === 0) {
        firstTeamObj.points = game.team1.score;
    } else {
        var bonusPoints = game.team1.score;
        for (var player in game.team1.playerStats) {
            if (game.team1.playerStats.hasOwnProperty(player)) {
                var playerObject = makePlayerObject(playerMap, player, game.team1.playerStats, game, pointScheme);
                bonusPoints -= playerObject.tossupTotal;
                firstTeamObj.match_players.push(playerObject.playerObject);
            }
        }
        firstTeamObj.bonus_points = bonusPoints;
        firstTeamObj.bonus_bounceback_points = !game.team1.bouncebacks ? 0 : parseFloat(game.team1.bouncebacks);
    }
    var secondTeamObj = {match_players : [], team : {$ref : "team_" + teamMap[game.team2.team_id].shortID}};
    if (numPlayersTeam2 === 0) {
        secondTeamObj.points = game.team2.score;
    } else {
        var bonusPoints = game.team2.score;
        for (var player in game.team2.playerStats) {
            if (game.team2.playerStats.hasOwnProperty(player)) {
                var playerObject = makePlayerObject(playerMap, player, game.team2.playerStats, game, pointScheme);
                // console.log(playerObject.playerObject);
                bonusPoints -= playerObject.tossupTotal;
                secondTeamObj.match_players.push(playerObject.playerObject);
            }
        }
        secondTeamObj.bonus_points = bonusPoints;
        secondTeamObj.bonus_bounceback_points = !game.team2.bouncebacks ? 0 : parseFloat(game.team2.bouncebacks);
    }
    gameObject.match_teams.push(firstTeamObj);
    gameObject.match_teams.push(secondTeamObj);
    if (game.phases) {
        for (var i = 0; i < game.phases.length; i++) {
            gameObject.match_questions.push(makeMatchQuestionObject(game.phases[i], teamMap, playerMap));
        }
    }
    return gameObject;
}

/**
* Creates a matchQuestion object adhering to QBJ format
* @param phase current match question with a tossup and bonus
* @param teamMap map of teams where key is teamid and value is shortID and teamname
* @param playerMap map of players where key is playerid and value is shortID and player_name
* @return a match question object with a number, bonus_points, bounceback_bonus_points, and an array of buzzes
*/
function makeMatchQuestionObject(phase, teamMap, playerMap) {
    var bonusPoints = 0;
    var bouncebackPoints = 0;
    for (var i = 0; i < phase.bonus.bonusParts.length; i++) {
        if (phase.bonus.bonusParts[i].gettingTeam) {
            bonusPoints += parseFloat(phase.bonus.bonusParts[i].value);
            if (phase.bonus.bonusParts[i].gettingTeam !== phase.bonus.forTeam) {
                bouncebackPoints += parseFloat(phase.bonus.bonusParts[i].value);
            }
        }
    }
    var matchQuestion = {
                    number : parseFloat(phase.number),
                    bonus_points : bonusPoints,
                    bounceback_bonus_points : bouncebackPoints,
                    buzzes : []
                };
    for (var i = 0; i < phase.tossup.answers.length; i++) {
        var answer = phase.tossup.answers[i];
        var buzzObject = {};
        buzzObject.team = {$ref : "team_" + teamMap[answer.team].shortID};
        buzzObject.player = {$ref : "player_" + playerMap[answer.player].shortID};
        buzzObject.result = {value : parseFloat(answer.value)};
        matchQuestion.buzzes.push(buzzObject);
    }
    return matchQuestion;
}

/**
* Creates a player object adhering to QBJ format
* @param playerMap map of players where key is playerid and value is shortID and player_name
* @param player id of the player for this object
* @param playerStats object where key is a playerid and value is the point values for a game by this player
* @param pointScheme tournament's point scheme so only correct answers in point values are accounted for
* @return a player object and the total sum of points this player scored in a game
*/
function makePlayerObject(playerMap, player, playerStats, game, pointScheme) {
    var playerObject = {
        player : {name : playerMap[player].name},
        tossups_heard : Math.floor(parseFloat(playerStats[player].gp) * game.tossupsheard),
        answer_counts : []
    };
    var tossupTotal = 0;
    for (var j = 0; j < pointScheme.length; j++) {
        var answerObject = {};
        answerObject.value = parseFloat(pointScheme[j]);
        if (playerStats[player][pointScheme[j]]) {
            var number = parseFloat(playerStats[player][pointScheme[j]]);
            if (number == null) {
                answerObject.number = 0;
            } else {
                answerObject.number = number;
            }
        } else {
            answerObject.number = 0;
        }
        tossupTotal += (answerObject.value * answerObject.number);
        playerObject.answer_counts.push(answerObject);
    }
    return {playerObject : playerObject, tossupTotal : tossupTotal};
}

exports.getTeamsInfo = getTeamsInfo;
exports.getPlayersInfo = getPlayersInfo;
exports.getFullTeamsGameInformation = getFullTeamsGameInformation;
exports.getFullPlayersGameInformation = getFullPlayersGameInformation;
exports.getFilteredTeamsInformation = getFilteredTeamsInformation;
exports.getFilteredPlayersInformation = getFilteredPlayersInformation;
exports.getRoundReport = getRoundReport;
exports.getPPBForRounds = getPPBForRounds;
exports.convertToQuizbowlSchema = convertToQuizbowlSchema;
exports.convertToSQBS = convertToSQBS;
