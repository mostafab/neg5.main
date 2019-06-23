function mapCycle(c, numCycle) {
  return {
    number: numCycle,
    answers: (c.answers || []).map(a => {
      return {
        playerId: a.playerId,
        teamId: a.teamId,
        type: a.type,
        value: a.value,
      }
    }),
    bonuses: (c.bonuses || []).map((b, idx) => {
      return {
        part: idx,
        answeringTeamId: b || null,
      }
    }) 
  }
}


export default {
  convertToScoresheetDto(tournamentId, game) {
    console.log(game);
    const scoresheet = {
      tournamentId: tournamentId,
      moderator: game.moderator,
      serialId: game.serialId,
      notes: game.notes,
      onTossup: game.onTossup,
      packet: game.packet,
      room: game.room,
      round: game.round,
      submitted: game.submitted,
      phases: (game.phases || []).map(p => p.id),
      teams: game.teams.map(t => {
        return {
          teamId: t.teamInfo.id,
          players: t.players.map(p => {
            return {
              playerId: p.id,
              active: p.active,
              tuh: p.tuh,
            }
          }),
        }
      }),
      cycles: game.cycles.map((c, idx) => {
        return mapCycle(c, idx)
      }),
      currentCycle: !game.currentCycle
        ? null
        : mapCycle(game.currentCycle, game.currentCycle.number),
    }
    return scoresheet;
  }
};
