import angular from 'angular';

export default class MatchService {
  constructor($q, MatchHttpService) {
    this.$q = $q;
    this.MatchHttpService = MatchHttpService;

    this.games = [];
  }

  postGame(tournamentId, game) {
    return this.$q((resolve, reject) => {
      const formattedGame = MatchService.formatGame(game);
      this.MatchHttpService.postMatch(tournamentId, formattedGame)
        .then(() => {
          this.getGames(tournamentId);
        })
        .catch(error => reject(error));
    });
  }

  getGames(tournamentId) {
    return this.$q((resolve, reject) => {
      this.MatchHttpService.getMatches(tournamentId)
        .then((matches) => {
          const formattedMatches = MatchService.formatAllGames(matches);
          angular.copy(formattedMatches, this.games);
        })
        .catch(error => reject(error));
    });
  }

  deleteGame(tournamentId, matchId) {
    return this.$q((resolve, reject) => {
      this.MatchHttpService.deleteMatch(tournamentId, matchId)
        .then((deletedMatchId) => {
          this.removeMatchFromArray(deletedMatchId);
          resolve();
        })
        .catch(error => reject(error));
    });
  }

  getGameById(tournamentId, gameId) {
    return this.$q((resolve, reject) => {
      this.MatchHttpService.getMatchById(tournamentId, gameId)
        .then(game => resolve(
          {
            addedBy: game.added_by,
            id: game.match_id,
            tuh: game.tossups_heard,
            moderator: game.moderator,
            notes: game.notes,
            packet: game.packet,
            room: game.room,
            round: game.round,
            teams: game.teams.map((team) => {
              return {
                id: team.team_id,
                name: team.team_name,
                overtime: team.overtime_tossups,
                bouncebacks: team.bounceback_points,
                score: team.score,
                players: team.players.map(player => ({
                  id: player.player_id,
                  name: player.player_name,
                  tuh: player.tossups_heard,
                  points: player.tossup_values.reduce((aggr, current) => {
                    aggr[current.value] = current.number;
                    return aggr;
                  }, {}),
                })),
              };
            }),
            phases: game.phases.map((phase) => {
              return {
                id: phase.phase_id,
                name: phase.phase_name,
              };
            }) },
        ))
        .catch(error => reject(error));
    });
  }

  editGame(tournamentId, gameId, gameInformation) {
    return this.$q((resolve, reject) => {
      const formattedGame = MatchService.formatGame(gameInformation);
      this.MatchHttpService.editMatch(tournamentId, gameId, formattedGame)
        .then((match) => {
          this.getGames(tournamentId);
          resolve(match);
        })
        .catch(error => reject(error));
    });
  }

  getTeamPlayers(tournamentId, teamId) {
    return this.$q((resolve, reject) => {
      this.MatchHttpService.getTeamPlayers(tournamentId, teamId)
        .then(players => resolve(players.map((p) => {
          return {
            id: p.player_id,
            name: p.player_name,
          };
        })))
        .catch(error => reject(error));
    });
  }

  removeMatchFromArray(matchId) {
    const index = this.games.findIndex(game => game.id === matchId);
    if (index !== -1) {
      this.games.splice(index, 1);
    }
  }

  static formatGame(game) {
    const gameCopy = {};
    angular.copy(game, gameCopy);
    gameCopy.phases = gameCopy.phases.map(phase => phase.id);
    gameCopy.teams = gameCopy.teams.map((team) => {
      return {
        id: team.teamInfo.id,
        score: team.score,
        bouncebacks: team.bouncebacks,
        overtime: team.overtime,
        players: team.players.map((player) => {
          return {
            id: player.id,
            tuh: player.tuh || 0,
            points: Object.keys(player.points)
                .map(Number).map((pv) => {
                  return {
                    value: pv,
                    number: player.points[pv] || 0,
                  };
                }),
          };
        }),
      };
    });
    return gameCopy;
  }

  static formatAllGames(games) {
    return games.map(({
      match_id: id,
      tossups_heard: tuh,
      round,
      team_1_id,
      team_1_score,
      team_2_id,
      team_2_score,
      team_1_name,
      team_2_name,
      phases }) => {
      return {
        id,
        tuh,
        round,
        teams: {
          one: {
            score: team_1_score,
            id: team_1_id,
            name: team_1_name,
          },
          two: {
            score: team_2_score,
            id: team_2_id,
            name: team_2_name,
          },
        },
        phases: phases.reduce((obj, current) => {
          obj[current.phase_id] = true;
          return obj;
        }, {}),
      };
    });
  }
}

MatchService.$inject = ['$q', 'MatchHttpService'];
