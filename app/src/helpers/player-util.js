export default {

  buildPlayerListFromTeams: teams =>
          teams.reduce((arr, currentTeam) =>
              arr.concat(currentTeam.players), []),

  buildPlayerMap: players =>
          players.reduce((aggr, current) => {
            aggr[current.player_id] = current;
            return aggr;
          }, {}),
};

