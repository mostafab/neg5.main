export const buildMatchPhasesObject = (tournamentId, matchId, phases) => ({
  phaseTournamentId: phases.map(() => tournamentId),
  phaseMatchId: phases.map(() => matchId),
  phaseId: phases,
});

export const buildMatchTeams = (tournamentid, matchId, teams) => ({
  teamIds: teams.map(team => team.id),
  matchId: teams.map(() => matchId),
  tournamentId: teams.map(() => tournamentid),
  score: teams.map(team => team.score),
  bouncebacks: teams.map(team => team.bouncebacks),
  overtime: teams.map(team => team.overtime),
});

export const buildMatchPlayers = (tournamentId, matchId, teams) => {
  let players = [];
  teams.forEach((team) => {
    players = players.concat(team.players);
  });
  return {
    players,
    playerIds: players.map(player => player.id),
    matchIds: players.map(() => matchId),
    tournamentIds: players.map(() => tournamentId),
    tossups: players.map(player => player.tuh),
  };
};

export const buildPlayerMatchPoints = (tournamentId, matchId, players) => {
  const playerPoints = [];
  players.forEach((player) => {
    player.points.forEach((pv) => {
      playerPoints.push({
        id: player.id,
        value: pv.value,
        number: pv.number,
      });
    });
  });
  return {
    playerIds: playerPoints.map(pp => pp.id),
    matchIds: playerPoints.map(() => matchId),
    tournamentIds: playerPoints.map(() => tournamentId),
    values: playerPoints.map(pp => pp.value),
    numbers: playerPoints.map(pp => pp.number),
  };
};
