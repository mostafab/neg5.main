"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.buildMatchPhasesObject = buildMatchPhasesObject;
exports.buildMatchTeams = buildMatchTeams;
exports.buildMatchPlayers = buildMatchPlayers;
function buildMatchPhasesObject(tournamentId, matchId, phases) {
    return {
        phaseTournamentId: phases.map(function (phase) {
            return tournamentId;
        }),
        phaseMatchId: phases.map(function (phase) {
            return matchId;
        }),
        phaseId: phases
    };
}

function buildMatchTeams(tournamentid, matchId, teams) {
    return {
        teamIds: teams.map(function (team) {
            return team.id;
        }),
        matchId: teams.map(function (team) {
            return matchId;
        }),
        tournamentId: teams.map(function (team) {
            return tournamentid;
        }),
        score: teams.map(function (team) {
            return team.score;
        }),
        bouncebacks: teams.map(function (team) {
            return team.bouncebacks;
        }),
        overtime: teams.map(function (team) {
            return team.overtime;
        })
    };
}

function buildMatchPlayers(tournamentId, matchId, teams) {
    var players = [];
    teams.forEach(function (team) {
        players = players.concat(team.players);
    });
    return {
        players: players,
        playerIds: players.map(function (player) {
            return player.id;
        }),
        matchIds: players.map(function (player) {
            return matchId;
        }),
        tournamentIds: players.map(function (player) {
            return tournamentId;
        }),
        tossups: players.map(function (player) {
            return player.tuh;
        })
    };
}