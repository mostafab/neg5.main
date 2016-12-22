"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {

  buildPlayerListFromTeams: function buildPlayerListFromTeams(teams) {
    return teams.reduce(function (arr, currentTeam) {
      return arr.concat(currentTeam.players);
    }, []);
  },

  buildPlayerMap: function buildPlayerMap(players) {
    return players.reduce(function (aggr, current) {
      aggr[current.player_id] = current;
      return aggr;
    }, {});
  }
};