export const groupDivisionsByPhase = divisions => divisions.reduce((map, current) => {
  map[current.phaseId] ? map[current.phaseId].push(current) : map[current.phaseId] = [current];
  return map;
}, {});

export const mapPhaseIdsToPhases = phases => phases.reduce((map, current) => {
  map[current.id] = current;
  return map;
}, {});

export const mapTeamsToDivisions = teams => teams.reduce((map, current) => {
  Object.values(current.divisions).forEach(divisionId => {
    map[divisionId] ? map[divisionId].push(current) : map[divisionId] = [current];
  })
  return map;
}, {});

export const getTotalPlayers = teams => teams.reduce((sum, current) => sum + current.players.length, 0);

