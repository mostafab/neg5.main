export let buildMatchPhasesObject = (tournamentId, matchId, phases) => {
    return {
        phaseTournamentId: phases.map(phase => tournamentId),
        phaseMatchId: phases.map(phase => matchId),
        phaseId: phases
    }
}

export let buildMatchTeams = (tournamentid, matchId, teams) => {
    return {
        teamIds: teams.map(team => team.id),
        matchId: teams.map(team => matchId),
        tournamentId: teams.map(team => tournamentid),
        score: teams.map(team => team.score),
        bouncebacks: teams.map(team => team.bouncebacks),
        overtime: teams.map(team => team.overtime)
    }
}

export let buildMatchPlayers = (tournamentId, matchId, teams) => {
    let players = [];
    teams.forEach(team => {
        players = players.concat(team.players);
    });
    return {
        players,
        playerIds: players.map(player => player.id),
        matchIds: players.map(player => matchId),
        tournamentIds: players.map(player => tournamentId),
        tossups: players.map(player => player.tuh)
    }
}

export let buildPlayerMatchPoints = (tournamentId, matchId, players) => {
    let playerPoints = [];
    players.forEach(player => {
        player.points.forEach(pv => {
            playerPoints.push({
                id: player.id,
                value: pv.value,
                number: pv.number
            })
        })
    })
    return {
        playerIds: playerPoints.map(pp => pp.id),
        matchIds: playerPoints.map(pp => matchId),
        tournamentIds: playerPoints.map(pp => tournamentId),
        values: playerPoints.map(pp => pp.value),
        numbers: playerPoints.map(pp => pp.number)
    }
}