"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var buildMatchPhasesObject = exports.buildMatchPhasesObject = function buildMatchPhasesObject(tournamentId, matchId, phases) {
    return {
        phaseTournamentId: phases.map(function (phase) {
            return tournamentId;
        }),
        phaseMatchId: phases.map(function (phase) {
            return matchId;
        }),
        phaseId: phases
    };
};

var buildMatchTeams = exports.buildMatchTeams = function buildMatchTeams(tournamentid, matchId, teams) {
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
};

var buildMatchPlayers = exports.buildMatchPlayers = function buildMatchPlayers(tournamentId, matchId, teams) {
    var players = [];
    teams.forEach(function (team) {
        players = players.concat(team.players.filter);
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
};

var buildPlayerMatchPoints = exports.buildPlayerMatchPoints = function buildPlayerMatchPoints(tournamentId, matchId, players) {
    var playerPoints = [];
    players.forEach(function (player) {
        player.points.forEach(function (pv) {
            playerPoints.push({
                id: player.id,
                value: pv.value,
                number: pv.number
            });
        });
    });
    return {
        playerIds: playerPoints.map(function (pp) {
            return pp.id;
        }),
        matchIds: playerPoints.map(function (pp) {
            return matchId;
        }),
        tournamentIds: playerPoints.map(function (pp) {
            return tournamentId;
        }),
        values: playerPoints.map(function (pp) {
            return pp.value;
        }),
        numbers: playerPoints.map(function (pp) {
            return pp.number;
        })
    };
};