const bktree = require("bktree");
const mongoose = require("mongoose");
const Tournament = mongoose.model("Tournament");

const SCHEMA_VERSION = "1.1";

/**
* Responsible for gathering basic statistics information about a tournament's teams
* and calling the given callback with an err if needed, the tournament found, and
* the array of team statistics
* @param tournamentid id of the tournament to get team statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of team statistics
*/
function getTeamsInfo(tournamentid, phaseID, callback) {
    var teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            var phaseInfo = {phase_id : "1", name : "All"};
            var teamMap = makeTeamMap(result.teams);
            result.currentPhaseID = 1;
            if (phaseID && phaseID != 1) {
                result.currentPhaseID = phaseID;
                for (var i = 0; i < result.phases.length; i++) {
                    if (result.phases[i].phase_id == phaseID) {
                        phaseInfo.phase_id = result.phases[i].phase_id;
                        phaseInfo.name = result.phases[i].name;
                    }
                }
                result.divisions = result.divisions.filter(division => {
                    return division.phase_id == phaseID;
                });
                result.games = result.games.filter(game => {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id] && game.phase_id.indexOf(phaseID) != -1;
                });
            } else {
                result.games = result.games.filter(game => {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                });
                for (var i = 0; i < result.phases.length; i++) {
                    if (result.phases[i].active) {
                        result.divisions = result.divisions.filter(division => {
                            return division.phase_id == result.phases[i].phase_id;
                        });
                        result.currentPhaseID = result.phases[i].phase_id;
                        break;
                    }
                }
            }
            result.phaseInfo = phaseInfo;
            for (var i = 0; i < result.teams.length; i++) {
                teamInfo.push(result.teams[i].getAverageInformation(result));
            }
            teamInfo.sort((first, second) => {
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
            result.divisions = result.divisions.map(division => {
                if (!division.name) {
                    return division;
                } else {
                    return division.name;
                }
            });
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
    var teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
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
            teamInfo.sort((first, second) => {
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
function getPlayersInfo(tournamentid, phaseID, callback) {
    var playersInfo = [];
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            var teamMap = makeTeamMap(result.teams);
            var phaseInfo = {phase_id : "1", name : "All"};
            if (phaseID && phaseID != 1) {
                for (var i = 0; i < result.phases.length; i++) {
                    if (result.phases[i].phase_id == phaseID) {
                        phaseInfo.phase_id = result.phases[i].phase_id;
                        phaseInfo.name = result.phases[i].name;
                    }
                }
                result.games = result.games.filter(game => {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id] && game.phase_id.indexOf(phaseID) != -1;
                });
            } else {
                result.games = result.games.filter(game => {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                });
            }
            for (var i = 0; i < result.players.length; i++) {
                playersInfo.push(result.players[i].getAllInformation(result, teamMap));
            }
            playersInfo.sort((first, second) => {
                return second.stats["PPG"] - first.stats["PPG"];
            });
            result.phaseInfo = phaseInfo;
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
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            var teamMap = makeTeamMap(result.teams);
            result.games = result.games.filter(game => {
                return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
            });
            if (constraints.teams) {
                for (var i = 0; i < result.players.length; i++) {
                    if (constraints.teams.indexOf(result.players[i].teamID) != -1) {
                        playersInfo.push(result.players[i].getAllInformationFiltered(result, constraints, teamMap));
                    }
                }
            } else {
                for (var i = 0; i < result.players.length; i++) {
                    playersInfo.push(result.players[i].getAllInformationFiltered(result, constraints, teamMap));
                }
            }
            playersInfo.sort((first, second) => {
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
function getFullTeamsGameInformation(tournamentid, phaseID, callback) {
    var teamsInfo = {};
    var playersInfo = {};
    var teamTotals = {};
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err, null, {}, {});
        } else if (result == null) {
            callback(null, null, {}, {});
        } else {
            var teamMap = makeTeamMap(result.teams);
            var phaseInfo = {phase_id : "1", name : "All"};
            if (phaseID && phaseID != 1) {
                for (var i = 0; i < result.phases.length; i++) {
                    if (result.phases[i].phase_id == phaseID) {
                        phaseInfo.phase_id = result.phases[i].phase_id;
                        phaseInfo.name = result.phases[i].name;
                    }
                }
                result.games = result.games.filter(game => {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id] && game.phase_id.indexOf(phaseID) != -1;
                });
            } else {
                result.games = result.games.filter(game => {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                });
            }
            result.phaseInfo = phaseInfo;
            for (var i = 0; i < result.teams.length; i++) {
                teamsInfo[result.teams[i].shortID] = {team : result.teams[i].team_name, games : result.teams[i].getAllGamesInformation(result, teamMap)};
                playersInfo[result.teams[i].shortID] = {team : result.teams[i].team_name, stats : result.teams[i].getPlayerStats(result, teamMap)};
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
function getFullPlayersGameInformation(tournamentid, phaseID, callback) {
    var playersInfo = {};
    var playerTotals = {};
    Tournament.findOne({shortID : tournamentid}, (err, tournament) => {
        if (err) {
            callback(err);
        } else if (tournament == null) {
            callback(null, null, {}, {});
        } else {
            var teamMap = makeTeamMap(tournament.teams);
            var phaseInfo = {phase_id : "1", name : "All"};
            if (phaseID && phaseID != 1) {
                for (var i = 0; i < tournament.phases.length; i++) {
                    if (tournament.phases[i].phase_id == phaseID) {
                        phaseInfo.phase_id = tournament.phases[i].phase_id;
                        phaseInfo.name = tournament.phases[i].name;
                    }
                }
                tournament.games = tournament.games.filter(game => {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id] && game.phase_id.indexOf(phaseID) != -1;
                });
            } else {
                tournament.games = tournament.games.filter(game => {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                });
            }
            for (var i = 0; i < tournament.players.length; i++) {
                var teamName = teamMap[tournament.players[i].teamID].name;
                playersInfo[tournament.players[i].shortID] = {name : tournament.players[i].player_name, team : teamName, games : tournament.players[i].getAllGamesInformation(tournament, teamMap)};
                playerTotals[tournament.players[i].shortID] = tournament.players[i].getTotalGameStats(tournament, teamMap);
            }
            tournament.phaseInfo = phaseInfo
            callback(null, tournament, playersInfo, playerTotals);
        }
    });
}

/**
* Gets round report information
* @param tournamentid id of the tournament to get round averages from
* @param callback callback function with an error (or null), tournament name, and the rounds information
*/
function getRoundReport(tournamentid, phaseID, callback) {
    Tournament.findOne({shortID : tournamentid}, (err, tournament) => {
        if (err) {
            callback(err);
        } else if (!tournament) {
            callback(null, null, null);
        } else {
            var phaseInfo = {phase_id : "1", name : "All"};
            if (phaseID && phaseID != 1) {
                for (var i = 0; i < tournament.phases.length; i++) {
                    if (tournament.phases[i].phase_id == phaseID) {
                        phaseInfo.phase_id = tournament.phases[i].phase_id;
                        phaseInfo.name = tournament.phases[i].name;
                    }
                }
                tournament.games = tournament.games.filter(game => {
                    return game.phase_id.indexOf(phaseID) != -1;
                });
            }
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
            tournament.phaseInfo = phaseInfo;
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
    var totalTossupsHeard = 0;
    var tossupPoints = 0;
    for (var i = 0; i < games.length; i++) {
        totalTossupsHeard +=  games[i].tossupsheard;
        if (games[i].team1 && games[i].team1.playerStats) {
            for (var player in games[i].team1.playerStats) {
                if (games[i].team1.playerStats.hasOwnProperty(player)) {
                    var stats = games[i].team1.playerStats[player];
                    for (var j = 0; j < pointTypes.length; j++) {
                        if (stats[pointTypes[j]]) {
                            var total = parseFloat(pointTypes[j]) * parseFloat(stats[pointTypes[j]]);
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
    if (totalTossupsHeard === 0) {
        return 0;
    } else {
        return +(tossupPoints / totalTossupsHeard).toFixed(2);
    }
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
                    for (var j = 0; j < pointKeys.length; j++) {
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
                    for (var j = 0; j < pointKeys.length; j++) {
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
    return totalTossupsGotten == 0 ? 0 : +(totalBonusPoints / totalTossupsGotten).toFixed(2);
}

/**
* Creates a team map where key is team id and values are team name and short id
* @param teams array of teams
* @return key value pairing of teams
*/
function makeTeamMap(teams) {
    var map = {};
    for (var i = 0; i < teams.length; i++) {
        map[teams[i]._id] = {name : teams[i].team_name, shortID : teams[i].shortID};
    }
    return map;
}

function exportScoresheets(tournamentid, callback) {
    Tournament.findOne({shortID : tournamentid}, (err, tournament) => {
        if (err) {
            callback(err);
        } else if (!tournament) {
            callback(null, null);
        } else {
            var rounds = {};
            var teamMap = makeTeamMap(tournament.teams);
            var playerMap = makePlayerMap(tournament.players);
            for (var i = 0; i < tournament.games.length; i++) {
                var currentGame = tournament.games[i];
                if (currentGame.phases && teamMap[currentGame.team1.team_id] && teamMap[currentGame.team2.team_id]) {
                    if (!rounds[currentGame.round]) {
                        rounds[currentGame.round] = [];
                    }
                    for (var j = 0; j < currentGame.phases.length; j++) {
                        var phase = currentGame.phases[j];
                        phase.question_number = parseFloat(phase.question_number);
                        for (var k = 0; k < phase.tossup.answers.length; k++) {
                            phase.tossup.answers[k].player =
                                playerMap[phase.tossup.answers[k].player] ? playerMap[phase.tossup.answers[k].player].name : "";
                            phase.tossup.answers[k].team =
                                teamMap[phase.tossup.answers[k].team] ? teamMap[phase.tossup.answers[k].team].name : "";
                            phase.tossup.answers[k].value = parseFloat(phase.tossup.answers[k].value);
                        }
                        if (phase.bonus.forTeam) {
                            phase.bonus.forTeam = teamMap[phase.bonus.forTeam].name;
                        }
                        for (var k = 0; k < phase.bonus.bonusParts.length; k++) {
                            if (phase.bonus.bonusParts[k].gettingTeam) {
                                phase.bonus.bonusParts[k].gettingTeam = teamMap[phase.bonus.bonusParts[k].gettingTeam].name;
                            }
                            phase.bonus.bonusParts[k].number = parseFloat(phase.bonus.bonusParts[k].number);
                            phase.bonus.bonusParts[k].value = parseFloat(phase.bonus.bonusParts[k].value);
                        }
                    }
                    var team1Players = [];
                    for (var playerid in currentGame.team1.playerStats) {
                        if (currentGame.team1.playerStats.hasOwnProperty(playerid)) {
                            var player = {name : playerMap[playerid] ? playerMap[playerid].name : ""};
                            var pointTotals = {};
                            for (var pv in tournament.pointScheme) {
                                if (tournament.pointScheme.hasOwnProperty(pv)) {
                                    if (currentGame.team1.playerStats[playerid][pv]) {
                                        pointTotals[pv] = parseFloat(currentGame.team1.playerStats[playerid][pv]);
                                    } else {
                                        pointTotals[pv] = 0;
                                    }
                                }
                            }
                            player.pointTotals = pointTotals;
                            player.tuh = Math.floor(parseFloat(currentGame.team1.playerStats[playerid].gp) * currentGame.tossupsheard);
                            team1Players.push(player);
                        }
                    }
                    var team2Players = [];
                    for (var playerid in currentGame.team2.playerStats) {
                        if (currentGame.team2.playerStats.hasOwnProperty(playerid)) {
                            var player = {name : playerMap[playerid] ? playerMap[playerid].name : ""};
                            var pointTotals = {};
                            for (var pv in tournament.pointScheme) {
                                if (tournament.pointScheme.hasOwnProperty(pv)) {
                                    if (currentGame.team2.playerStats[playerid][pv]) {
                                        pointTotals[pv] = parseFloat(currentGame.team2.playerStats[playerid][pv]);
                                    } else {
                                        pointTotals[pv] = 0;
                                    }
                                }
                            }
                            player.pointTotals = pointTotals;
                            player.tuh = Math.floor(parseFloat(currentGame.team2.playerStats[playerid].gp) * currentGame.tossupsheard);
                            team2Players.push(player);
                        }
                    }
                    var team1 = {name : teamMap[currentGame.team1.team_id].name, score : currentGame.team1.score, players : team1Players};
                    var team2 = {name : teamMap[currentGame.team2.team_id].name, score : currentGame.team2.score, players : team2Players};
                    var round = currentGame.round;
                    var room = currentGame.room;
                    var moderator = currentGame.moderator;
                    var packet = currentGame.packet;
                    var notes = currentGame.notes;
                    var gameTitle = team1.name.replace(" ", "_").toLowerCase() + "_" +
                        team2.name.replace(" ", "_").toLowerCase();
                    rounds[currentGame.round].push({round : round, team1 : team1, team2 : team2, room : room, moderator : moderator,
                        packet : packet, notes : notes, gameTitle : gameTitle, questions : tournament.games[i].phases});
                }
            }
            callback(null, {rounds : rounds, pointScheme : tournament.pointScheme});
        }
    });
}

/**
* Converts a tournament from the Mongo database to an SQBS readable format
* For more information on the SQBS format, visit : https://code.google.com/p/qbsql/source/browse/trunk/functions.php#504
* @param tournamentid id of the tournament to convert
* @param callback callback function with an error (or null) and the sqbs string
*/
function convertToSQBS(tournamentid, callback) {
    Tournament.findOne({shortID : tournamentid}, (err, tournament) => {
        if (err) {
            callback(err);
        } else if (!tournament) {
            callback(null, null);
        } else {
            sqbsString += tournament.teams.length + "\n"; // Number of teams
            tournament.teams.sort(function(first, second) {
                return first.team_name.localeCompare(second.team_name);
            });
            // Build the team map where key is team's _id and value contains the team's name, its players, and the team index
            var teamMap = {};
            var teamIndex = 0;
            for (var i = 0; i < tournament.teams.length; i++) {
                teamMap[tournament.teams[i]._id] = {team_name : tournament.teams[i].team_name, players : [], team_index : teamIndex};
                teamIndex++;
            }
            tournament.players.sort((first, second) => {
                return first.player_name.localeCompare(second.player_name);
            });
            for (var i = 0; i < tournament.players.length; i++) {
                var numPlayers = teamMap[tournament.players[i].teamID].players.length; // The number of players already in a team's players array. This represents the a player's index
                teamMap[tournament.players[i].teamID].players.push({name : tournament.players[i].player_name, id : tournament.players[i]._id, player_index : numPlayers});
            }
            for (var teamid in teamMap) {
                if (teamMap.hasOwnProperty(teamid)) {
                    sqbsString += (teamMap[teamid].players.length + 1) + "\n"; // Number of players on each team plus the team itself
                    sqbsString += teamMap[teamid].team_name + "\n"; // Team name
                    for (var i = 0; i < teamMap[teamid].players.length; i++) {
                        sqbsString += teamMap[teamid].players[i].name + "\n"; // Player name
                    }
                }
            }
            // console.log(JSON.stringify(teamMap, null, 2));
            sqbsString += tournament.games.length + "\n"; // Number of games
            for (var i = 0; i < tournament.games.length; i++) {
                var currentGame = tournament.games[i];
                if (teamMap[currentGame.team1.team_id] && teamMap[currentGame.team2.team_id]) {
                    sqbsString += i + "\n"; // Identifier for current game
                    sqbsString += teamMap[currentGame.team1.team_id].team_index + "\n"; // Index of team 1
                    sqbsString += teamMap[currentGame.team2.team_id].team_index + "\n"; // Index of team 2
                    sqbsString += currentGame.team1.score + "\n"; // Team 1 Score
                    sqbsString += currentGame.team2.score + "\n"; // Team 2 Score
                    sqbsString += currentGame.tossupsheard + "\n"; // Game tossups heard
                    sqbsString += currentGame.round + "\n"; // Game round
                    sqbsString += "3\n"; // Team 1 bonus count
                    sqbsString += "200\n"; // Team 1 bonus points
                    sqbsString += "5\n"; // Team 2 bonus count
                    sqbsString += "110\n"; // Team 2 bonus points
                    sqbsString += "0\n"; // Overtime
                    sqbsString += "0\n"; // Team 1 correct overtime tossups
                    sqbsString += "0\n"; // Team 2 correct overtime tossups
                    sqbsString += "0\n"; // Forfeit == team1?
                    sqbsString += "0\n"; // Lightning round, not supported
                    sqbsString += "0\n"; // Lightning round, not supported
                    var current = 0;
                    for (var player in currentGame.team1.playerStats) {
                        if (currentGame.team1.playerStats.hasOwnProperty(player)) {
                            var index = -1;
                            for (var j = 0; j < teamMap[currentGame.team1.team_id].players.length; j++) {
                                if (player == teamMap[currentGame.team1.team_id].players[j].id) {
                                    index = teamMap[currentGame.team1.team_id].players[j].player_index;
                                    break;
                                }
                            }
                            sqbsString += index + "\n"; // Player index
                            sqbsString += "1\n"; // Fraction of game played
                            sqbsString += "2\n"; // Powers
                            sqbsString += "2\n"; // Tossups
                            sqbsString += "1\n"; // Negs
                            sqbsString += "0\n"; // Always 0
                            sqbsString += "30\n"; // Tossup points
                            current++;
                        }
                    }
                    while (current < 7) {
                        sqbsString += "-1\n0\n0\n0\n0\n0\n0\n";
                        current++;
                    }
                    current = 0;
                    for (var player in currentGame.team2.playerStats) {
                        if (currentGame.team2.playerStats.hasOwnProperty(player)) {
                            var index = -1;
                            for (var j = 0; j < teamMap[currentGame.team2.team_id].players.length; j++) {
                                if (player == teamMap[currentGame.team2.team_id].players[j].id) {
                                    index = teamMap[currentGame.team2.team_id].players[j].player_index;
                                    // console.log(index);
                                    break;
                                }
                            }
                            sqbsString += index + "\n"; // Player index
                            sqbsString += "1\n"; // Fraction of game played
                            sqbsString += "2\n"; // Powers
                            sqbsString += "2\n"; // Tossups
                            sqbsString += "1\n"; // Negs
                            sqbsString += "0\n"; // Always 0
                            sqbsString += "30\n"; // Tossup points
                            current++;
                        }
                    }
                    while (current < 7) {
                        sqbsString += "-1\n0\n0\n0\n0\n0\n0\n";
                        current++;
                    }
                }
            }
            sqbsString = sqbsString.replace(/\n$/, "");
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
    Tournament.findOne({shortID : tournamentid}, (err, tournament) => {
        if (err) {
            callback(err, null);
        } else if (!tournament) {
            callback(null, null);
        } else {
            var qbjObj = {version : SCHEMA_VERSION, objects : []};
            var tournamentObject = {matches : [], registrations : [], type : "Tournament", name : tournament.tournament_name};
            var teamMap = {};
            // var registrationObjects = makeRegistrationObjects(tournament.teams);
            for (var i = 0; i < tournament.teams.length; i++) {
                var teamObj = {id : "team_" + tournament.teams[i].shortID,
                    name : tournament.teams[i].team_name, players : [], shortID : tournament.teams[i].shortID}
                teamMap[tournament.teams[i]._id] = {id : "team_" + tournament.teams[i].shortID,
                    name : tournament.teams[i].team_name, players : [], shortID : tournament.teams[i].shortID};
                // tournamentObject.registrations.push({$ref : "school_" + tournament.teams[i].shortID});
            }
            for (var i = 0; i < tournament.players.length; i++) {
                var teamid = tournament.players[i].teamID;
                var playerObj = {id : "player_" + tournament.players[i].shortID, name : tournament.players[i].player_name};
                teamMap[teamid].players.push(playerObj);
            }
            // var teams =
            for (var teamid in teamMap) {
                if (teamMap.hasOwnProperty(teamid)) {

                    var teamObj = {type : "Registration"};
                    teamObj.id = "school_" + teamMap[teamid].shortID;
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
                var game = makeGameObject(tournament.games[i], teamMap, playerMap, Object.keys(tournament.pointScheme));
                if (game) {
                    qbjObj.objects.push(makeGameObject(tournament.games[i], teamMap, playerMap, Object.keys(tournament.pointScheme)));
                }
            }
            qbjObj.objects.push(tournamentObject);
            callback(null, qbjObj);
        }
    });
}

/**
* Couples teams together based on bktree and longest-common-subsequence
*/
function makeRegistrationObjects(teams) {
    var teamNames = teams.map(team => {
        return team.team_name;
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
    if (teamMap[game.team1.team_id] && teamMap[game.team2.team_id]) {
        var firstTeamObj = {match_players : [], team : {$ref : "team_" + teamMap[game.team1.team_id].shortID}};
        if (numPlayersTeam1 === 0) {
            firstTeamObj.points = game.team1.score;
        } else {
            var bonusPoints = game.team1.score;
            for (var player in game.team1.playerStats) {
                if (game.team1.playerStats.hasOwnProperty(player)) {
                    var playerObject = makePlayerObject(playerMap, player, game.team1.playerStats, game, pointScheme);
                    bonusPoints -= playerObject.tossupTotal;
                    if (playerObject.playerObject) {
                        firstTeamObj.match_players.push(playerObject.playerObject);
                    }
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
                    bonusPoints -= playerObject.tossupTotal;
                    if (playerObject.playerObject) {
                        secondTeamObj.match_players.push(playerObject.playerObject);
                    }
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
    return null;
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
                    number : parseFloat(phase.question_number),
                    bonus_points : bonusPoints,
                    bounceback_bonus_points : bouncebackPoints,
                    buzzes : []
                };
    for (var i = 0; i < phase.tossup.answers.length; i++) {
        var answer = phase.tossup.answers[i];
        if (teamMap[answer.team] && playerMap[answer.player]) {
            var buzzObject = {};
            buzzObject.team = {$ref : "team_" + teamMap[answer.team].shortID};
            buzzObject.player = {$ref : "player_" + playerMap[answer.player].shortID};
            buzzObject.result = {value : parseFloat(answer.value)};
            matchQuestion.buzzes.push(buzzObject);
        }
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
    var playerObject = null;
    if (playerMap[player]) {
        playerObject = {
            player : {name : playerMap[player].name},
            tossups_heard : Math.floor(parseFloat(playerStats[player].gp) * game.tossupsheard),
            answer_counts : []
        };
    }
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
        if (playerObject) {
            playerObject.answer_counts.push(answerObject);
        }
    }
    return {playerObject : playerObject, tossupTotal : tossupTotal};
}

function findTournamentsByNameAndSet(name, set, callback) {
    try {
        var query;
        var trex = new RegExp(".*" + name.trim() + ".*", "i");
        var qrex = new RegExp(".*" + set.trim() + ".*", "i");
        if (name.trim().length === 0) {
            query = {questionSet : qrex};
        } else if (set.trim().length === 0) {
            query = {tournament_name : trex};
        } else {
            query = {$and : [{tournament_name : trex}, {questionSet : qrex}]};
        }
        var fields = {tournament_name : 1, questionSet : 1, shortID : 1};
        Tournament.find(query, fields, (err, tournaments) => {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                tournaments.sort(function(first, second) {
                    return first.tournament_name.localeCompare(second.tournament_name);
                });
                callback(null, tournaments);
            }
        });
    } catch (exception) {
        callback(exception);
    }
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
exports.exportScoresheets = exportScoresheets;
exports.findTournamentsByNameAndSet = findTournamentsByNameAndSet;
exports.makeTeamMap = makeTeamMap;
