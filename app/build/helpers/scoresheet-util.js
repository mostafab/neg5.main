"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var preprocessMatchScoresheets = function preprocessMatchScoresheets(matches, playerMap) {

    matches.forEach(function (match) {
        var _teamMap;

        var teamMap = (_teamMap = {}, _defineProperty(_teamMap, match.team_1_id, match.team_1_name), _defineProperty(_teamMap, match.team_2_id, match.team_2_name), _teamMap);

        match.scoresheet.forEach(function (cycle) {
            cycle.answers.forEach(function (a) {
                a.playerName = playerMap[a.playerId];
                a.teamName = teamMap[a.teamId];
            });
        });
    });
};