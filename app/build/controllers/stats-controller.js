'use strict';

var mongoose = require('mongoose');
var mdiff = require('mdiff');
var Tournament = mongoose.model('Tournament');

var stringFunctions = require('../libs/string-functions');

var SCHEMA_VERSION = '1.2';

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
    Tournament.findOne({ shortID: tournamentid }, function (err, result) {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            (function () {
                var phaseInfo = { phase_id: "1", name: "All" };
                var teamMap = makeTeamMap(result.teams);
                result.currentPhaseID = 1;
                if (phaseID && phaseID != 1) {
                    result.currentPhaseID = phaseID;
                    for (var _i = 0; _i < result.phases.length; _i++) {
                        if (result.phases[_i].phase_id == phaseID) {
                            phaseInfo.phase_id = result.phases[_i].phase_id;
                            phaseInfo.name = result.phases[_i].name;
                        }
                    }
                    result.divisions = result.divisions.filter(function (division) {
                        return division.phase_id == phaseID;
                    });
                    result.games = result.games.filter(function (game) {
                        return teamMap[game.team1.team_id] && teamMap[game.team2.team_id] && game.phase_id.indexOf(phaseID) != -1;
                    });
                } else {
                    result.games = result.games.filter(function (game) {
                        return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                    });

                    var _loop = function _loop(_i2) {
                        if (result.phases[_i2].active) {
                            result.divisions = result.divisions.filter(function (division) {
                                return division.phase_id == result.phases[_i2].phase_id;
                            });
                            result.currentPhaseID = result.phases[_i2].phase_id;
                            return 'break';
                        }
                    };

                    for (var _i2 = 0; _i2 < result.phases.length; _i2++) {
                        var _ret2 = _loop(_i2);

                        if (_ret2 === 'break') break;
                    }
                }
                result.phaseInfo = phaseInfo;
                result.teams.forEach(function (team) {
                    teamInfo.push(team.getAverageInformation(result));
                });
                teamInfo.sort(function (first, second) {
                    if (second.stats["Win %"] == first.stats["Win %"]) {
                        if (second.stats["PPG"] == first.stats["PPG"]) {
                            return second.stats["PPB"] - first.stats["PPB"];
                        }
                        return second.stats["PPG"] - first.stats["PPG"];
                    } else {
                        return second.stats["Win %"] - first.stats["Win %"];
                    }
                });
                var rank = 1;
                teamInfo.forEach(function (team) {
                    team.stats["Rank"] = rank;
                    rank++;
                });
                result.divisions = result.divisions.map(function (division) {
                    if (!division.name) {
                        return division;
                    } else {
                        return division.name;
                    }
                });
                callback(null, result, teamInfo);
            })();
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
    Tournament.findOne({ shortID: tournamentid }, function (err, result) {
        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            if (constraints.teams) {
                result.teams.forEach(function (team) {
                    if (constraints.teams.indexOf(team._id.toString()) !== -1) {
                        teamInfo.push(team.getAverageInformationFiltered(result, constraints));
                    }
                });
            } else {
                result.teams.forEach(function (team) {
                    teamInfo.push(team.getAverageInformationFiltered(result, constraints));
                });
            }
            teamInfo.sort(function (first, second) {
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
    Tournament.findOne({ shortID: tournamentid }, function (err, result) {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            (function () {
                var teamMap = makeTeamMap(result.teams);
                var phaseInfo = { phase_id: "1", name: "All" };
                if (phaseID && phaseID != 1) {
                    for (var _i3 = 0; _i3 < result.phases.length; _i3++) {
                        if (result.phases[_i3].phase_id == phaseID) {
                            phaseInfo.phase_id = result.phases[_i3].phase_id;
                            phaseInfo.name = result.phases[_i3].name;
                        }
                    }
                    result.games = result.games.filter(function (game) {
                        return teamMap[game.team1.team_id] && teamMap[game.team2.team_id] && game.phase_id.indexOf(phaseID) != -1;
                    });
                } else {
                    result.games = result.games.filter(function (game) {
                        return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                    });
                }
                result.players.forEach(function (player) {
                    playersInfo.push(player.getAllInformation(result, teamMap));
                });
                playersInfo.sort(function (first, second) {
                    return second.stats["PPG"] - first.stats["PPG"];
                });
                result.phaseInfo = phaseInfo;
                callback(null, result, playersInfo);
            })();
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
    Tournament.findOne({ shortID: tournamentid }, function (err, result) {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            (function () {
                var teamMap = makeTeamMap(result.teams);
                result.games = result.games.filter(function (game) {
                    return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                });
                if (constraints.teams) {
                    result.players.forEach(function (player) {
                        if (constraints.teams.indexOf(player.teamID) != -1) {
                            playersInfo.push(player.getAllInformationFiltered(result, constraints, teamMap));
                        }
                    });
                } else {
                    result.players.forEach(function (player) {
                        playersInfo.push(player.getAllInformationFiltered(result, constraints, teamMap));
                    });
                }
                playersInfo.sort(function (first, second) {
                    return second.stats["PPG"] - first.stats["PPG"];
                });
                callback(null, result, playersInfo);
            })();
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
    Tournament.findOne({ shortID: tournamentid }, function (err, result) {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, {}, {});
        } else {
            (function () {
                var teamMap = makeTeamMap(result.teams);
                var phaseInfo = { phase_id: "1", name: "All" };
                if (phaseID && phaseID != 1) {
                    for (var _i4 = 0; _i4 < result.phases.length; _i4++) {
                        if (result.phases[_i4].phase_id == phaseID) {
                            phaseInfo.phase_id = result.phases[_i4].phase_id;
                            phaseInfo.name = result.phases[_i4].name;
                        }
                    }
                    result.games = result.games.filter(function (game) {
                        return teamMap[game.team1.team_id] && teamMap[game.team2.team_id] && game.phase_id.indexOf(phaseID) != -1;
                    });
                } else {
                    result.games = result.games.filter(function (game) {
                        return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                    });
                }
                result.phaseInfo = phaseInfo;
                result.teams.forEach(function (team) {
                    teamsInfo[team.shortID] = { team: team.team_name, games: team.getAllGamesInformation(result, teamMap) };
                    playersInfo[team.shortID] = { team: team.team_name, stats: team.getPlayerStats(result, teamMap) };
                    teamTotals[team.shortID] = { team: team.team_name, stats: team.getTotalGameStats(result) };
                });
                callback(null, result, teamsInfo, playersInfo, teamTotals);
            })();
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
    Tournament.findOne({ shortID: tournamentid }, function (err, tournament) {
        if (err) {
            callback(err);
        } else if (tournament == null) {
            callback(null, null, {}, {});
        } else {
            (function () {
                var teamMap = makeTeamMap(tournament.teams);
                var phaseInfo = { phase_id: "1", name: "All" };
                if (phaseID && phaseID != 1) {
                    for (var _i5 = 0; _i5 < tournament.phases.length; _i5++) {
                        if (tournament.phases[_i5].phase_id == phaseID) {
                            phaseInfo.phase_id = tournament.phases[_i5].phase_id;
                            phaseInfo.name = tournament.phases[_i5].name;
                        }
                    }
                    tournament.games = tournament.games.filter(function (game) {
                        return teamMap[game.team1.team_id] && teamMap[game.team2.team_id] && game.phase_id.indexOf(phaseID) != -1;
                    });
                } else {
                    tournament.games = tournament.games.filter(function (game) {
                        return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
                    });
                }
                tournament.players.forEach(function (player) {
                    var teamName = teamMap[player.teamID].name;
                    playersInfo[player.shortID] = { name: player.player_name, team: teamName, games: player.getAllGamesInformation(tournament, teamMap) };
                    playerTotals[player.shortID] = player.getTotalGameStats(tournament, teamMap);
                });
                tournament.phaseInfo = phaseInfo;
                callback(null, tournament, playersInfo, playerTotals);
            })();
        }
    });
}

/**
* Gets round report information
* @param tournamentid id of the tournament to get round averages from
* @param callback callback function with an error (or null), tournament name, and the rounds information
*/
function getRoundReport(tournamentid, phaseID, callback) {
    Tournament.findOne({ shortID: tournamentid }, function (err, tournament) {
        if (err) {
            callback(err);
        } else if (!tournament) {
            callback(null, null, null);
        } else {
            (function () {
                var phaseInfo = { phase_id: "1", name: "All" };
                if (phaseID && phaseID != 1) {
                    for (var _i6 = 0; _i6 < tournament.phases.length; _i6++) {
                        if (tournament.phases[_i6].phase_id == phaseID) {
                            phaseInfo.phase_id = tournament.phases[_i6].phase_id;
                            phaseInfo.name = tournament.phases[_i6].name;
                        }
                    }
                    tournament.games = tournament.games.filter(function (game) {
                        return game.phase_id.indexOf(phaseID) != -1;
                    });
                }
                var gameRounds = {};
                for (var _i7 = 0; _i7 < tournament.games.length; _i7++) {
                    var round = tournament.games[_i7].round;
                    if (!gameRounds[round]) {
                        gameRounds[round] = [];
                    }
                    gameRounds[round].push(tournament.games[_i7]);
                }
                var roundAverages = {};
                var rounds = Object.keys(gameRounds);
                rounds.forEach(function (round) {
                    roundAverages[round] = {};
                    roundAverages[round]["PPG/Team"] = getRoundPPG(gameRounds[round]);
                    roundAverages[round]["TUPts/TUH"] = getRoundTUPts(gameRounds[round], tournament.pointScheme);
                    roundAverages[round]["PPB"] = getPPBForRounds(gameRounds[round], tournament.pointScheme, tournament.pointsTypes);
                });
                tournament.phaseInfo = phaseInfo;
                callback(null, tournament, roundAverages);
            })();
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
    games.forEach(function (game) {
        if (game.team1) {
            totalPoints += game.team1.score;
            totalTeams++;
        }
        if (game.team2) {
            totalPoints += game.team2.score;
            totalTeams++;
        }
    });
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
    games.forEach(function (game) {
        totalTossupsHeard += game.tossupsheard;
        if (game.team1 && game.team1.playerStats) {
            for (var player in game.team1.playerStats) {
                if (game.team1.playerStats.hasOwnProperty(player)) {
                    (function () {
                        var stats = game.team1.playerStats[player];
                        pointTypes.forEach(function (pt) {
                            if (stats[pt]) {
                                var total = parseFloat(pt) * parseFloat(stats[pt]);
                                tossupPoints += total;
                            }
                        });
                    })();
                }
            }
        }
        if (game.team2 && game.team2.playerStats) {
            for (var _player in game.team2.playerStats) {
                if (game.team2.playerStats.hasOwnProperty(_player)) {
                    (function () {
                        var stats = game.team2.playerStats[_player];
                        pointTypes.forEach(function (pt) {
                            if (stats[pt]) {
                                var total = parseFloat(pt) * parseFloat(stats[pt]);
                                tossupPoints += total;
                            }
                        });
                    })();
                }
            }
        }
    });
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

    games.forEach(function (game) {
        if (game.team1 && game.team1.playerStats) {
            var bonusPoints = game.team1.score - game.team1.bouncebacks;
            for (var player in game.team1.playerStats) {
                if (game.team1.playerStats.hasOwnProperty(player)) {
                    (function () {
                        var stats = game.team1.playerStats[player];
                        pointKeys.forEach(function (pt) {
                            if (pointTypes[pt] != "N" && stats[pt]) {
                                totalTossupsGotten += parseFloat(stats[pt]);
                            }
                            if (stats[pt]) {
                                bonusPoints -= parseFloat(stats[pt]) * parseFloat(pt);
                            }
                        });
                    })();
                }
            }
            totalBonusPoints += bonusPoints;
        }
        if (game.team2 && game.team2.playerStats) {
            var _bonusPoints = game.team2.score - game.team2.bouncebacks;
            for (var _player2 in game.team2.playerStats) {
                if (game.team2.playerStats.hasOwnProperty(_player2)) {
                    (function () {
                        var stats = game.team2.playerStats[_player2];
                        pointKeys.forEach(function (pt) {
                            if (pointTypes[pt] != "N" && stats[pt]) {
                                totalTossupsGotten += parseFloat(stats[pt]);
                            }
                            if (stats[pt]) {
                                _bonusPoints -= parseFloat(stats[pt]) * parseFloat(pt);
                            }
                        });
                    })();
                }
            }
            totalBonusPoints += _bonusPoints;
        }
    });
    return totalTossupsGotten == 0 ? 0 : +(totalBonusPoints / totalTossupsGotten).toFixed(2);
}

/**
* Creates a team map where key is team id and values are team name and short id
* @param teams array of teams
* @return key value pairing of teams
*/
function makeTeamMap(teams) {
    if (!teams) {
        return {};
    }
    var map = {};
    teams.forEach(function (team) {
        map[team._id] = { name: team.team_name, shortID: team.shortID };
    });
    return map;
}

function exportScoresheets(tournamentid, callback) {
    Tournament.findOne({ shortID: tournamentid }, function (err, tournament) {
        if (err) {
            callback(err);
        } else if (!tournament) {
            callback(null, null);
        } else {
            (function () {
                var rounds = {};
                var teamMap = makeTeamMap(tournament.teams);
                var playerMap = makePlayerMap(tournament.players);
                tournament.games.forEach(function (game) {
                    if (game.phases && teamMap[game.team1.team_id] && teamMap[game.team2.team_id]) {
                        if (!rounds[game.round]) {
                            rounds[game.round] = [];
                        }
                        game.phases.forEach(function (phase) {
                            phase.question_number = parseFloat(phase.question_number);
                            phase.tossup.answers.forEach(function (answer) {
                                answer.player = playerMap[answer.player] ? playerMap[answer.player].name : "";
                                answer.team = teamMap[answer.team] ? teamMap[answer.team].name : "";
                                answer.value = parseFloat(answer.value);
                            });
                            if (phase.bonus.forTeam) {
                                phase.bonus.forTeam = teamMap[phase.bonus.forTeam].name;
                            }
                            phase.bonus.bonusParts.forEach(function (bonusPart) {
                                if (bonusPart.gettingTeam) {
                                    bonusPart.gettingTeam = teamMap[bonusPart.gettingTeam].name;
                                }
                                bonusPart.number = parseFloat(bonusPart.number);
                                bonusPart.value = parseFloat(bonusPart.value);
                            });
                        });
                        var team1Players = [];
                        for (var playerid in game.team1.playerStats) {
                            if (game.team1.playerStats.hasOwnProperty(playerid)) {
                                var player = { name: playerMap[playerid] ? playerMap[playerid].name : "" };
                                var pointTotals = {};
                                for (var pv in tournament.pointScheme) {
                                    if (tournament.pointScheme.hasOwnProperty(pv)) {
                                        if (game.team1.playerStats[playerid][pv]) {
                                            pointTotals[pv] = parseFloat(game.team1.playerStats[playerid][pv]);
                                        } else {
                                            pointTotals[pv] = 0;
                                        }
                                    }
                                }
                                player.pointTotals = pointTotals;
                                player.tuh = Math.floor(parseFloat(game.team1.playerStats[playerid].gp) * game.tossupsheard);
                                team1Players.push(player);
                            }
                        }
                        var team2Players = [];
                        for (var _playerid in game.team2.playerStats) {
                            if (game.team2.playerStats.hasOwnProperty(_playerid)) {
                                var _player3 = { name: playerMap[_playerid] ? playerMap[_playerid].name : "" };
                                var _pointTotals = {};
                                for (var _pv in tournament.pointScheme) {
                                    if (tournament.pointScheme.hasOwnProperty(_pv)) {
                                        if (game.team2.playerStats[_playerid][_pv]) {
                                            _pointTotals[_pv] = parseFloat(game.team2.playerStats[_playerid][_pv]);
                                        } else {
                                            _pointTotals[_pv] = 0;
                                        }
                                    }
                                }
                                _player3.pointTotals = _pointTotals;
                                _player3.tuh = Math.floor(parseFloat(game.team2.playerStats[_playerid].gp) * game.tossupsheard);
                                team2Players.push(_player3);
                            }
                        }
                        var team1 = { name: teamMap[game.team1.team_id].name, score: game.team1.score, players: team1Players };
                        var team2 = { name: teamMap[game.team2.team_id].name, score: game.team2.score, players: team2Players };
                        var round = game.round;
                        var room = game.room;
                        var moderator = game.moderator;
                        var packet = game.packet;
                        var notes = game.notes;
                        var gameTitle = team1.name.replace(" ", "_").toLowerCase() + "_" + team2.name.replace(" ", "_").toLowerCase();
                        rounds[game.round].push({ round: round, team1: team1, team2: team2, room: room, moderator: moderator,
                            packet: packet, notes: notes, gameTitle: gameTitle, questions: game.phases });
                    }
                });
                callback(null, { rounds: rounds, pointScheme: tournament.pointScheme });
            })();
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
    Tournament.findOne({ shortID: tournamentid }, function (err, tournament) {
        if (err) {
            callback(err);
        } else if (!tournament) {
            callback(null, null);
        } else {
            (function () {
                var sqbsString = "";
                sqbsString += tournament.teams.length + "\n"; // Number of teams
                tournament.teams.sort(function (first, second) {
                    return first.team_name.localeCompare(second.team_name);
                });
                // Build the team map where key is team's _id and value contains the team's name, its players, and the team index
                var teamMap = {};
                var teamIndex = 0;
                tournament.teams.forEach(function (team) {
                    teamMap[team._id] = { team_name: team.team_name, players: [], team_index: teamIndex };
                    teamIndex++;
                });
                tournament.players.sort(function (first, second) {
                    return first.player_name.localeCompare(second.player_name);
                });
                tournament.players.forEach(function (player) {
                    var numPlayers = teamMap[player.teamID].players.length;
                    teamMap[player.teamID].players.push({ name: player.player_name, id: player._id, player_index: numPlayers });
                });
                for (var teamid in teamMap) {
                    if (teamMap.hasOwnProperty(teamid)) {
                        sqbsString += teamMap[teamid].players.length + 1 + "\n"; // Number of players on each team plus the team itself
                        sqbsString += teamMap[teamid].team_name + "\n"; // Team name
                        teamMap[teamid].players.forEach(function (player) {
                            sqbsString += player.name + "\n"; // Player name
                        });
                    }
                }
                sqbsString += tournament.games.length + "\n"; // Number of games
                tournament.games.forEach(function (game) {
                    if (teamMap[game.team1.team_id] && teamMap[game.team2.team_id]) {
                        sqbsString += i + "\n"; // Identifier for current game
                        sqbsString += teamMap[game.team1.team_id].team_index + "\n"; // Index of team 1
                        sqbsString += teamMap[game.team2.team_id].team_index + "\n"; // Index of team 2
                        sqbsString += game.team1.score + "\n"; // Team 1 Score
                        sqbsString += game.team2.score + "\n"; // Team 2 Score
                        sqbsString += game.tossupsheard + "\n"; // Game tossups heard
                        sqbsString += game.round + "\n"; // Game round
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

                        var _loop2 = function _loop2(player) {
                            if (game.team1.playerStats.hasOwnProperty(player)) {
                                var index = -1;
                                teamMap[game.team1.team_id].players.forEach(function (playerID) {
                                    if (player == playerID.id) {
                                        index = playerID.player_index;
                                    }
                                });
                                sqbsString += index + "\n"; // Player index
                                sqbsString += "1\n"; // Fraction of game played
                                sqbsString += "2\n"; // Powers
                                sqbsString += "2\n"; // Tossups
                                sqbsString += "1\n"; // Negs
                                sqbsString += "0\n"; // Always 0
                                sqbsString += "30\n"; // Tossup points
                                current++;
                            }
                        };

                        for (var player in game.team1.playerStats) {
                            _loop2(player);
                        }
                        while (current < 7) {
                            sqbsString += "-1\n0\n0\n0\n0\n0\n0\n";
                            current++;
                        }
                        current = 0;

                        var _loop3 = function _loop3(_player4) {
                            if (game.team2.playerStats.hasOwnProperty(_player4)) {
                                var index = -1;
                                teamMap[game.team2.team_id].players.forEach(function (playerID) {
                                    if (_player4 == playerID.id) {
                                        index = playerID.player_index;
                                    }
                                });
                                sqbsString += index + "\n"; // Player index
                                sqbsString += "1\n"; // Fraction of game played
                                sqbsString += "2\n"; // Powers
                                sqbsString += "2\n"; // Tossups
                                sqbsString += "1\n"; // Negs
                                sqbsString += "0\n"; // Always 0
                                sqbsString += "30\n"; // Tossup points
                                current++;
                            }
                        };

                        for (var _player4 in game.team2.playerStats) {
                            _loop3(_player4);
                        }
                        while (current < 7) {
                            sqbsString += "-1\n0\n0\n0\n0\n0\n0\n";
                            current++;
                        }
                    }
                });
                sqbsString = sqbsString.replace(/\n$/, "");
                callback(null, sqbsString);
            })();
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
    Tournament.findOne({ shortID: tournamentid }, function (err, tournament) {
        if (err) {
            callback(err, null);
        } else if (!tournament) {
            callback(null, null);
        } else {
            var roundObject;

            (function () {
                var qbjObj = { version: SCHEMA_VERSION, objects: [] };
                var tournamentObject = { type: "Tournament", phases: [{ name: 'All Rounds', rounds: [] }], registrations: [], name: tournament.tournament_name, question_set: tournament.questionSet, info: tournament.description };
                var teamMap = {};
                var teamNameMap = {};
                tournament.teams.forEach(function (team) {
                    var matchingTeams = tournament.teams.filter(function (otherTeam) {
                        return !teamMap[otherTeam._id] && stringFunctions.levenshteinDistance(otherTeam.team_name.toLowerCase(), team.team_name.toLowerCase()) < 2;
                    });
                    matchingTeams.forEach(function (otherTeam) {
                        teamMap[otherTeam._id] = { id: "team_" + otherTeam.shortID,
                            name: otherTeam.team_name, players: [], shortID: otherTeam.shortID };
                    });
                    matchingTeams = matchingTeams.map(function (otherTeam) {
                        var copy = { team_name: otherTeam.team_name, _id: otherTeam._id, shortID: otherTeam.shortID };
                        var teamPlayers = tournament.players.filter(function (player) {
                            return player.teamID == otherTeam._id;
                        });
                        copy.players = teamPlayers;
                        return copy;
                    });
                    if (matchingTeams.length === 1) {
                        teamNameMap[matchingTeams[0].team_name] = matchingTeams;
                    } else if (matchingTeams.length > 1) {
                        var lcs = mdiff(matchingTeams[0].team_name, matchingTeams[1].team_name).getLcs();
                        teamNameMap[lcs] = matchingTeams;
                    }
                });
                var counter = 1;
                for (var teamName in teamNameMap) {
                    if (teamNameMap.hasOwnProperty(teamName)) {
                        var regObj = makeRegistrationObject(teamName, teamNameMap[teamName], counter);
                        qbjObj.objects.push(regObj);
                        tournamentObject.registrations.push({ $ref: regObj.id });
                        counter++;
                    }
                }
                var playerMap = makePlayerMap(tournament.players);
                var pointScheme = Object.keys(tournament.pointScheme);
                var gameMap = {};
                tournament.games.forEach(function (game) {
                    var gameObj = makeGameObject(game, teamMap, playerMap, pointScheme);
                    if (gameObj) {
                        qbjObj.objects.push(gameObj);
                    }
                    if (!gameMap[game.round]) {
                        gameMap[game.round] = [];
                    }
                    gameMap[game.round].push({ $ref: 'game_' + game.shortID });
                });
                for (var roundNumber in gameMap) {
                    if (gameMap.hasOwnProperty(roundNumber)) {
                        roundObject = { name: "Round " + roundNumber, matches: gameMap[roundNumber] };

                        tournamentObject.phases[0].rounds.push(roundObject);
                    }
                }
                qbjObj.objects.push(tournamentObject);
                callback(null, qbjObj);
            })();
        }
    });
}

/**
* Couples teams together based on bktree and longest-common-subsequence
* TODO
*/
function makeRegistrationObject(schoolName, teams, counter) {
    var lowercaseTeamName = schoolName.toLowerCase().replace(/\s/g, '_');
    var regObj = { name: schoolName, teams: [], id: 'school_' + counter + '_' + lowercaseTeamName, type: 'Registration' };
    teams.forEach(function (team) {
        var teamObj = { name: team.team_name, id: 'team_' + team.shortID, players: [] };
        team.players.forEach(function (player) {
            teamObj.players.push({ name: player.player_name, id: 'player_' + player.shortID });
        });
        regObj.teams.push(teamObj);
    });
    return regObj;
}

/**
* Creates a map of all players in a given tournament where the key is the player's id
* and the value is the player's shortID and name
* @param players array of players
* @return map of all players
*/
function makePlayerMap(players) {
    var playerMap = {};
    players.forEach(function (player) {
        playerMap[player._id] = { shortID: player.shortID, name: player.player_name };
    });
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
    var gameObject = { id: "game_" + game.shortID, location: game.room,
        match_teams: [], match_questions: [], round: game.round, tossups_read: game.tossupsheard,
        type: "Match", moderator: game.moderator, notes: game.notes };
    if (game.team1.overtimeTossupsGotten && game.team2.overtimeTossupsGotten) {
        gameObject.overtime_tossups_read = game.team1.overtimeTossupsGotten + game.team2.overtimeTossupsGotten;
    } else {
        gameObject.overtime_tossups_read = 0;
    }
    var numPlayersTeam1 = Object.keys(game.team1.playerStats).length;
    var numPlayersTeam2 = Object.keys(game.team2.playerStats).length;
    if (teamMap[game.team1.team_id] && teamMap[game.team2.team_id]) {
        var firstTeamObj = { match_players: [], team: { $ref: "team_" + teamMap[game.team1.team_id].shortID } };
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
        var secondTeamObj = { match_players: [], team: { $ref: "team_" + teamMap[game.team2.team_id].shortID } };
        if (numPlayersTeam2 === 0) {
            secondTeamObj.points = game.team2.score;
        } else {
            var _bonusPoints2 = game.team2.score;
            for (var _player5 in game.team2.playerStats) {
                if (game.team2.playerStats.hasOwnProperty(_player5)) {
                    var _playerObject = makePlayerObject(playerMap, _player5, game.team2.playerStats, game, pointScheme);
                    _bonusPoints2 -= _playerObject.tossupTotal;
                    if (_playerObject.playerObject) {
                        secondTeamObj.match_players.push(_playerObject.playerObject);
                    }
                }
            }
            secondTeamObj.bonus_points = _bonusPoints2;
            secondTeamObj.bonus_bounceback_points = !game.team2.bouncebacks ? 0 : parseFloat(game.team2.bouncebacks);
        }
        gameObject.match_teams.push(firstTeamObj);
        gameObject.match_teams.push(secondTeamObj);
        if (game.phases) {
            game.phases.forEach(function (phase) {
                gameObject.match_questions.push(makeMatchQuestionObject(phase, teamMap, playerMap));
            });
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
    phase.bonus.bonusParts.forEach(function (bonusPart) {
        if (bonusPart.gettingTeam) {
            bonusPoints += parseFloat(bonusPart.value);
            if (bonusPart.gettingTeam !== phase.bonus.forTeam) {
                bouncebackPoints += parseFloat(bonusPart.value);
            }
        }
    });
    var matchQuestion = {
        number: parseFloat(phase.question_number),
        bonus_points: bonusPoints,
        bounceback_bonus_points: bouncebackPoints,
        buzzes: []
    };
    phase.tossup.answers.forEach(function (answer) {
        if (teamMap[answer.team] && playerMap[answer.player]) {
            var buzzObject = {};
            buzzObject.team = { $ref: "team_" + teamMap[answer.team].shortID };
            buzzObject.player = { $ref: "player_" + playerMap[answer.player].shortID };
            buzzObject.result = { value: parseFloat(answer.value) };
            matchQuestion.buzzes.push(buzzObject);
        }
    });
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
            player: { $ref: 'player_' + playerMap[player].shortID },
            tossups_heard: Math.floor(parseFloat(playerStats[player].gp) * game.tossupsheard),
            answer_counts: []
        };
    }
    var tossupTotal = 0;
    pointScheme.forEach(function (pv) {
        var answerObject = { answer_type: {} };
        answerObject.answer_type.value = parseFloat(pv);
        if (playerStats[player][pv]) {
            var number = parseFloat(playerStats[player][pv]);
            if (number == null) {
                answerObject.number = 0;
            } else {
                answerObject.number = number;
            }
        } else {
            answerObject.number = 0;
        }
        tossupTotal += answerObject.answer_type.value * answerObject.number;
        if (playerObject) {
            playerObject.answer_counts.push(answerObject);
        }
    });
    return { playerObject: playerObject, tossupTotal: tossupTotal };
}

function findTournamentsByNameAndSet(name, set, callback) {
    try {
        var query = {};
        var trex = new RegExp(".*" + name.trim() + ".*", "i");
        var qrex = new RegExp(".*" + set.trim() + ".*", "i");
        if (name.trim().length === 0) {
            query = { $and: [{ questionSet: qrex }, { hidden: false }] };
        } else if (set.trim().length === 0) {
            query = { $and: [{ tournament_name: trex }, { hidden: false }] };
        } else {
            query = { $and: [{ tournament_name: trex }, { questionSet: qrex }, { hidden: false }] };
        }
        var fields = { tournament_name: 1, questionSet: 1, shortID: 1, phases: 1, _id: 0 };
        Tournament.find(query, fields, function (err, tournaments) {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                tournaments.sort(function (first, second) {
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