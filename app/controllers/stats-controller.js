'use strict';

const mongoose = require('mongoose');
const mdiff = require('mdiff');
const Tournament = mongoose.model('Tournament');

const stringFunctions = require('../libs/string-functions');

const SCHEMA_VERSION = '1.2';

/**
* Responsible for gathering basic statistics information about a tournament's teams
* and calling the given callback with an err if needed, the tournament found, and
* the array of team statistics
* @param tournamentid id of the tournament to get team statistics from
* @param callback asynchronous callback function called after this function is done with the
* list of team statistics
*/
function getTeamsInfo(tournamentid, phaseID, callback) {
    let teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            let phaseInfo = {phase_id : "1", name : "All"};
            const teamMap = makeTeamMap(result.teams);
            result.currentPhaseID = 1;
            if (phaseID && phaseID != 1) {
                result.currentPhaseID = phaseID;
                for (let i = 0; i < result.phases.length; i++) {
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
                for (let i = 0; i < result.phases.length; i++) {
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
            result.teams.forEach(team => {
                teamInfo.push(team.getAverageInformation(result));
            });
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
            let rank = 1;
            teamInfo.forEach(team => {
                team.stats["Rank"] = rank;
                rank++;
            });
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
    let teamInfo = [];
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err, null, []);
        } else if (result == null) {
            callback(null, null, [])
        } else {
            if (constraints.teams) {
                result.teams.forEach(team => {
                    if (constraints.teams.indexOf(team._id.toString()) !== -1) {
                        teamInfo.push(team.getAverageInformationFiltered(result, constraints));
                    }
                });
            } else {
                result.teams.forEach(team => {
                    teamInfo.push(team.getAverageInformationFiltered(result, constraints));
                });
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
    let playersInfo = [];
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            const teamMap = makeTeamMap(result.teams);
            let phaseInfo = {phase_id : "1", name : "All"};
            if (phaseID && phaseID != 1) {
                for (let i = 0; i < result.phases.length; i++) {
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
            result.players.forEach(player => {
                playersInfo.push(player.getAllInformation(result, teamMap));
            });
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
    let playersInfo = [];
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, []);
        } else {
            const teamMap = makeTeamMap(result.teams);
            result.games = result.games.filter(game => {
                return teamMap[game.team1.team_id] && teamMap[game.team2.team_id];
            });
            if (constraints.teams) {
                result.players.forEach(player => {
                    if (constraints.teams.indexOf(player.teamID) != -1) {
                        playersInfo.push(player.getAllInformationFiltered(result, constraints, teamMap));
                    }
                });
            } else {
                result.players.forEach(player => {
                    playersInfo.push(player.getAllInformationFiltered(result, constraints, teamMap));
                });
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
    let teamsInfo = {};
    let playersInfo = {};
    let teamTotals = {};
    Tournament.findOne({shortID : tournamentid}, (err, result) => {
        if (err) {
            callback(err);
        } else if (result == null) {
            callback(null, null, {}, {});
        } else {
            const teamMap = makeTeamMap(result.teams);
            let phaseInfo = {phase_id : "1", name : "All"};
            if (phaseID && phaseID != 1) {
                for (let i = 0; i < result.phases.length; i++) {
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
            result.teams.forEach(team => {
                teamsInfo[team.shortID] = {team : team.team_name, games : team.getAllGamesInformation(result, teamMap)};
                playersInfo[team.shortID] = {team : team.team_name, stats : team.getPlayerStats(result, teamMap)};
                teamTotals[team.shortID] = {team : team.team_name, stats : team.getTotalGameStats(result)};
            });
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
    let playersInfo = {};
    let playerTotals = {};
    Tournament.findOne({shortID : tournamentid}, (err, tournament) => {
        if (err) {
            callback(err);
        } else if (tournament == null) {
            callback(null, null, {}, {});
        } else {
            const teamMap = makeTeamMap(tournament.teams);
            let phaseInfo = {phase_id : "1", name : "All"};
            if (phaseID && phaseID != 1) {
                for (let i = 0; i < tournament.phases.length; i++) {
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
            tournament.players.forEach(player => {
                let teamName = teamMap[player.teamID].name;
                playersInfo[player.shortID] = {name : player.player_name, team : teamName, games : player.getAllGamesInformation(tournament, teamMap)};
                playerTotals[player.shortID] = player.getTotalGameStats(tournament, teamMap);
            });
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
            let phaseInfo = {phase_id : "1", name : "All"};
            if (phaseID && phaseID != 1) {
                for (let i = 0; i < tournament.phases.length; i++) {
                    if (tournament.phases[i].phase_id == phaseID) {
                        phaseInfo.phase_id = tournament.phases[i].phase_id;
                        phaseInfo.name = tournament.phases[i].name;
                    }
                }
                tournament.games = tournament.games.filter(game => {
                    return game.phase_id.indexOf(phaseID) != -1;
                });
            }
            let gameRounds = {};
            for (let i = 0; i < tournament.games.length; i++) {
                let round = tournament.games[i].round;
                if (!gameRounds[round]) {
                    gameRounds[round] = [];
                }
                gameRounds[round].push(tournament.games[i]);
            }
            let roundAverages = {};
            const rounds = Object.keys(gameRounds);
            rounds.forEach(round => {
                roundAverages[round] = {};
                roundAverages[round]["PPG/Team"] = getRoundPPG(gameRounds[round]);
                roundAverages[round]["TUPts/TUH"] = getRoundTUPts(gameRounds[round], tournament.pointScheme);
                roundAverages[round]["PPB"] = getPPBForRounds(gameRounds[round], tournament.pointScheme, tournament.pointsTypes);
            });
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
    let totalPoints = 0;
    let totalTeams = 0;
    games.forEach(game => {
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
    const pointTypes = Object.keys(pointScheme);
    let totalTossupsHeard = 0;
    let tossupPoints = 0;
    games.forEach(game => {
        totalTossupsHeard +=  game.tossupsheard;
        if (game.team1 && game.team1.playerStats) {
            for (let player in game.team1.playerStats) {
                if (game.team1.playerStats.hasOwnProperty(player)) {
                    let stats = game.team1.playerStats[player];
                    pointTypes.forEach(pt => {
                        if (stats[pt]) {
                            const total = parseFloat(pt) * parseFloat(stats[pt]);
                            tossupPoints += total;
                        }
                    });
                }
            }
        }
        if (game.team2 && game.team2.playerStats) {
            for (let player in game.team2.playerStats) {
                if (game.team2.playerStats.hasOwnProperty(player)) {
                    let stats = game.team2.playerStats[player];
                    pointTypes.forEach(pt => {
                        if (stats[pt]) {
                            const total = parseFloat(pt) * parseFloat(stats[pt]);
                            tossupPoints += total;
                        }
                    });
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
    let totalBonusPoints = 0;
    let totalTossupsGotten = 0;
    const pointKeys = Object.keys(pointScheme);

    games.forEach(game => {
        if (game.team1 && game.team1.playerStats) {
            let bonusPoints = game.team1.score - game.team1.bouncebacks;
            for (let player in game.team1.playerStats) {
                if (game.team1.playerStats.hasOwnProperty(player)) {
                    let stats = game.team1.playerStats[player];
                    pointKeys.forEach(pt => {
                        if (pointTypes[pt] != "N" && stats[pt]) {
                            totalTossupsGotten += parseFloat(stats[pt]);
                        }
                        if (stats[pt]) {
                            bonusPoints -= parseFloat(stats[pt]) * parseFloat(pt);
                        }
                    });
                }
            }
            totalBonusPoints += bonusPoints;
        }
        if (game.team2 && game.team2.playerStats) {
            let bonusPoints = game.team2.score - game.team2.bouncebacks;
            for (let player in game.team2.playerStats) {
                if (game.team2.playerStats.hasOwnProperty(player)) {
                    let stats = game.team2.playerStats[player];
                    pointKeys.forEach(pt => {
                        if (pointTypes[pt] != "N" && stats[pt]) {
                            totalTossupsGotten += parseFloat(stats[pt]);
                        }
                        if (stats[pt]) {
                            bonusPoints -= parseFloat(stats[pt]) * parseFloat(pt);
                        }
                    });
                }
            }
            totalBonusPoints += bonusPoints;
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
    const map = {};
    teams.forEach(team => {
        map[team._id] = {name : team.team_name, shortID : team.shortID};
    });
    return map;
}

function exportScoresheets(tournamentid, callback) {
    Tournament.findOne({shortID : tournamentid}, (err, tournament) => {
        if (err) {
            callback(err);
        } else if (!tournament) {
            callback(null, null);
        } else {
            const rounds = {};
            const teamMap = makeTeamMap(tournament.teams);
            const playerMap = makePlayerMap(tournament.players);
            tournament.games.forEach(game => {
                if (game.phases && teamMap[game.team1.team_id] && teamMap[game.team2.team_id]) {
                    if (!rounds[game.round]) {
                        rounds[game.round] = [];
                    }
                    game.phases.forEach(phase => {
                        phase.question_number = parseFloat(phase.question_number);
                        phase.tossup.answers.forEach(answer => {
                            answer.player = playerMap[answer.player] ? playerMap[answer.player].name : "";
                            answer.team = teamMap[answer.team] ? teamMap[answer.team].name : "";
                            answer.value = parseFloat(answer.value);
                        });
                        if (phase.bonus.forTeam) {
                            phase.bonus.forTeam = teamMap[phase.bonus.forTeam].name;
                        }
                        phase.bonus.bonusParts.forEach(bonusPart => {
                            if (bonusPart.gettingTeam) {
                                bonusPart.gettingTeam = teamMap[bonusPart.gettingTeam].name;
                            }
                            bonusPart.number = parseFloat(bonusPart.number);
                            bonusPart.value = parseFloat(bonusPart.value);
                        });
                    });
                    let team1Players = [];
                    for (let playerid in game.team1.playerStats) {
                        if (game.team1.playerStats.hasOwnProperty(playerid)) {
                            const player = {name : playerMap[playerid] ? playerMap[playerid].name : ""};
                            const pointTotals = {};
                            for (let pv in tournament.pointScheme) {
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
                    let team2Players = [];
                    for (let playerid in game.team2.playerStats) {
                        if (game.team2.playerStats.hasOwnProperty(playerid)) {
                            const player = {name : playerMap[playerid] ? playerMap[playerid].name : ""};
                            const pointTotals = {};
                            for (let pv in tournament.pointScheme) {
                                if (tournament.pointScheme.hasOwnProperty(pv)) {
                                    if (game.team2.playerStats[playerid][pv]) {
                                        pointTotals[pv] = parseFloat(game.team2.playerStats[playerid][pv]);
                                    } else {
                                        pointTotals[pv] = 0;
                                    }
                                }
                            }
                            player.pointTotals = pointTotals;
                            player.tuh = Math.floor(parseFloat(game.team2.playerStats[playerid].gp) * game.tossupsheard);
                            team2Players.push(player);
                        }
                    }
                    const team1 = {name : teamMap[game.team1.team_id].name, score : game.team1.score, players : team1Players};
                    const team2 = {name : teamMap[game.team2.team_id].name, score : game.team2.score, players : team2Players};
                    const round = game.round;
                    const room = game.room;
                    const moderator = game.moderator;
                    const packet = game.packet;
                    const notes = game.notes;
                    const gameTitle = team1.name.replace(" ", "_").toLowerCase() + "_" +
                        team2.name.replace(" ", "_").toLowerCase();
                    rounds[game.round].push({round : round, team1 : team1, team2 : team2, room : room, moderator : moderator,
                        packet : packet, notes : notes, gameTitle : gameTitle, questions : game.phases});
                }
            });
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
            let sqbsString = "";
            sqbsString += tournament.teams.length + "\n"; // Number of teams
            tournament.teams.sort((first, second) => {
                return first.team_name.localeCompare(second.team_name);
            });
            // Build the team map where key is team's _id and value contains the team's name, its players, and the team index
            const teamMap = {};
            let teamIndex = 0;
            tournament.teams.forEach(team => {
                teamMap[team._id] = {team_name : team.team_name, players : [], team_index : teamIndex};
                teamIndex++;
            });
            tournament.players.sort((first, second) => {
                return first.player_name.localeCompare(second.player_name);
            });
            tournament.players.forEach(player => {
                let numPlayers = teamMap[player.teamID].players.length;
                teamMap[player.teamID].players.push({name : player.player_name, id : player._id, player_index : numPlayers});
            });
            for (let teamid in teamMap) {
                if (teamMap.hasOwnProperty(teamid)) {
                    sqbsString += (teamMap[teamid].players.length + 1) + "\n"; // Number of players on each team plus the team itself
                    sqbsString += teamMap[teamid].team_name + "\n"; // Team name
                    teamMap[teamid].players.forEach(player => {
                        sqbsString += player.name + "\n"; // Player name
                    });
                }
            }
            sqbsString += tournament.games.length + "\n"; // Number of games
            tournament.games.forEach(game => {
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
                    let current = 0;
                    for (let player in game.team1.playerStats) {
                        if (game.team1.playerStats.hasOwnProperty(player)) {
                            let index = -1;
                            teamMap[game.team1.team_id].players.forEach(playerID => {
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
                    }
                    while (current < 7) {
                        sqbsString += "-1\n0\n0\n0\n0\n0\n0\n";
                        current++;
                    }
                    current = 0;
                    for (let player in game.team2.playerStats) {
                        if (game.team2.playerStats.hasOwnProperty(player)) {
                            let index = -1;
                            teamMap[game.team2.team_id].players.forEach(playerID => {
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
                    }
                    while (current < 7) {
                        sqbsString += "-1\n0\n0\n0\n0\n0\n0\n";
                        current++;
                    }
                }
            });
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
            const qbjObj = {version : SCHEMA_VERSION, objects : []};
            const tournamentObject = {type : "Tournament", phases : [{name : 'All Rounds', rounds : []}], registrations : [], name : tournament.tournament_name, question_set : tournament.questionSet, info : tournament.description};
            const teamMap = {};
            const teamNameMap = {};
            tournament.teams.forEach(team => {
                let matchingTeams = tournament.teams.filter(otherTeam => {
                    return !teamMap[otherTeam._id] && stringFunctions.levenshteinDistance(otherTeam.team_name.toLowerCase(), team.team_name.toLowerCase()) < 2;
                });
                matchingTeams.forEach(otherTeam => {
                    teamMap[otherTeam._id] = {id : "team_" + otherTeam.shortID,
                        name : otherTeam.team_name, players : [], shortID : otherTeam.shortID};
                });
                matchingTeams = matchingTeams.map(otherTeam => {
                    const copy = {team_name : otherTeam.team_name, _id : otherTeam._id, shortID : otherTeam.shortID};
                    const teamPlayers = tournament.players.filter(player => {
                        return player.teamID == otherTeam._id;
                    });
                    copy.players = teamPlayers;
                    return copy;
                });
                if (matchingTeams.length === 1) {
                    teamNameMap[matchingTeams[0].team_name] = matchingTeams;
                } else if (matchingTeams.length > 1) {
                    const lcs = mdiff(matchingTeams[0].team_name, matchingTeams[1].team_name).getLcs();
                    teamNameMap[lcs] = matchingTeams;
                }
            });
            let counter = 1;
            for (let teamName in teamNameMap) {
                if (teamNameMap.hasOwnProperty(teamName)) {
                    const regObj = makeRegistrationObject(teamName, teamNameMap[teamName], counter);
                    qbjObj.objects.push(regObj);
                    tournamentObject.registrations.push({$ref : regObj.id});
                    counter++;
                }
            }
            const playerMap = makePlayerMap(tournament.players);
            const pointScheme = Object.keys(tournament.pointScheme);
            const gameMap = {};
            tournament.games.forEach(game => {
                let gameObj = makeGameObject(game, teamMap, playerMap, pointScheme);
                if (gameObj) {
                    qbjObj.objects.push(gameObj);
                }
                if (!gameMap[game.round]) {
                    gameMap[game.round] = [];
                }
                gameMap[game.round].push({$ref : 'game_' + game.shortID});
            });
            for (let roundNumber in gameMap) {
                if (gameMap.hasOwnProperty(roundNumber)) {
                    var roundObject = {name : "Round " + roundNumber, matches : gameMap[roundNumber]};
                    tournamentObject.phases[0].rounds.push(roundObject);
                }
            }
            qbjObj.objects.push(tournamentObject);
            callback(null, qbjObj);
        }
    });
}

/**
* Couples teams together based on bktree and longest-common-subsequence
* TODO
*/
function makeRegistrationObject(schoolName, teams, counter) {
    const lowercaseTeamName = schoolName.toLowerCase().replace(/\s/g, '_');
    const regObj = {name : schoolName, teams : [], id : 'school_' + counter + '_' + lowercaseTeamName, type : 'Registration'};
    teams.forEach(team => {
        const teamObj = {name : team.team_name, id : 'team_' + team.shortID, players : []};
        team.players.forEach(player => {
            teamObj.players.push({name : player.player_name, id : 'player_' + player.shortID});
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
    const playerMap = {};
    players.forEach(player => {
        playerMap[player._id] = {shortID : player.shortID, name : player.player_name};
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
    const gameObject = {id : "game_" + game.shortID, location : game.room,
        match_teams : [], match_questions : [], round : game.round, tossups_read : game.tossupsheard,
        type : "Match", moderator : game.moderator, notes : game.notes};
    if (game.team1.overtimeTossupsGotten && game.team2.overtimeTossupsGotten) {
        gameObject.overtime_tossups_read = game.team1.overtimeTossupsGotten + game.team2.overtimeTossupsGotten;
    } else {
        gameObject.overtime_tossups_read = 0;
    }
    const numPlayersTeam1 = Object.keys(game.team1.playerStats).length;
    const numPlayersTeam2 = Object.keys(game.team2.playerStats).length;
    if (teamMap[game.team1.team_id] && teamMap[game.team2.team_id]) {
        const firstTeamObj = {match_players : [], team : {$ref : "team_" + teamMap[game.team1.team_id].shortID}};
        if (numPlayersTeam1 === 0) {
            firstTeamObj.points = game.team1.score;
        } else {
            let bonusPoints = game.team1.score;
            for (let player in game.team1.playerStats) {
                if (game.team1.playerStats.hasOwnProperty(player)) {
                    const playerObject = makePlayerObject(playerMap, player, game.team1.playerStats, game, pointScheme);
                    bonusPoints -= playerObject.tossupTotal;
                    if (playerObject.playerObject) {
                        firstTeamObj.match_players.push(playerObject.playerObject);
                    }
                }
            }
            firstTeamObj.bonus_points = bonusPoints;
            firstTeamObj.bonus_bounceback_points = !game.team1.bouncebacks ? 0 : parseFloat(game.team1.bouncebacks);
        }
        const secondTeamObj = {match_players : [], team : {$ref : "team_" + teamMap[game.team2.team_id].shortID}};
        if (numPlayersTeam2 === 0) {
            secondTeamObj.points = game.team2.score;
        } else {
            let bonusPoints = game.team2.score;
            for (let player in game.team2.playerStats) {
                if (game.team2.playerStats.hasOwnProperty(player)) {
                    const playerObject = makePlayerObject(playerMap, player, game.team2.playerStats, game, pointScheme);
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
            game.phases.forEach(phase => {
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
    let bonusPoints = 0;
    let bouncebackPoints = 0;
    phase.bonus.bonusParts.forEach(bonusPart => {
        if (bonusPart.gettingTeam) {
            bonusPoints += parseFloat(bonusPart.value);
            if (bonusPart.gettingTeam !== phase.bonus.forTeam) {
                bouncebackPoints += parseFloat(bonusPart.value);
            }
        }
    });
    const matchQuestion = {
                    number : parseFloat(phase.question_number),
                    bonus_points : bonusPoints,
                    bounceback_bonus_points : bouncebackPoints,
                    buzzes : []
                };
    phase.tossup.answers.forEach(answer => {
        if (teamMap[answer.team] && playerMap[answer.player]) {
            const buzzObject = {};
            buzzObject.team = {$ref : "team_" + teamMap[answer.team].shortID};
            buzzObject.player = {$ref : "player_" + playerMap[answer.player].shortID};
            buzzObject.result = {value : parseFloat(answer.value)};
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
    let playerObject = null;
    if (playerMap[player]) {
        playerObject = {
            player : {$ref : 'player_' + playerMap[player].shortID},
            tossups_heard : Math.floor(parseFloat(playerStats[player].gp) * game.tossupsheard),
            answer_counts : []
        };
    }
    let tossupTotal = 0;
    pointScheme.forEach(pv => {
        const answerObject = {answer_type : {}};
        answerObject.answer_type.value = parseFloat(pv);
        if (playerStats[player][pv]) {
            let number = parseFloat(playerStats[player][pv]);
            if (number == null) {
                answerObject.number = 0;
            } else {
                answerObject.number = number;
            }
        } else {
            answerObject.number = 0;
        }
        tossupTotal += (answerObject.answer_type.value * answerObject.number);
        if (playerObject) {
            playerObject.answer_counts.push(answerObject);
        }
    });
    return {playerObject : playerObject, tossupTotal : tossupTotal};
}

function findTournamentsByNameAndSet(name, set, callback) {
    try {
        let query = {};
        const trex = new RegExp(".*" + name.trim() + ".*", "i");
        const qrex = new RegExp(".*" + set.trim() + ".*", "i");
        if (name.trim().length === 0) {
            query = {$and : [{questionSet : qrex}, {hidden : false}]};
        } else if (set.trim().length === 0) {
            query = {$and : [{tournament_name : trex}, {hidden : false}]};
        } else {
            query = {$and : [{tournament_name : trex}, {questionSet : qrex}, {hidden : false}]};
        }
        const fields = {tournament_name : 1, questionSet : 1, shortID : 1, _id : 0};
        Tournament.find(query, fields, (err, tournaments) => {
            if (err) {
                console.log(err);
                callback(err);
            } else {
                tournaments.sort((first, second) => {
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
