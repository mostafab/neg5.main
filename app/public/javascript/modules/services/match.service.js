import angular from 'angular';

export default class MatchService {
  constructor($q, TeamService, TournamentService, MatchHttpService) {
    this.$q = $q;
    this.MatchHttpService = MatchHttpService;
    this.TournamentService = TournamentService;
    this.TeamService = TeamService;

    this.games = [];
    this.phases = [];
    this.teams = TeamService.teams;
    this.currentGame = MatchService.newGame();

    this.loadedGame = {};
    this.loadedGameOriginal = {};
  }

  postGame(tournamentId) {
    return this.$q((resolve, reject) => {
      const formattedGame = MatchService.formatGame(this.currentGame);
      this.MatchHttpService.postMatch(tournamentId, formattedGame)
        .then(() => {
          this.getGames(tournamentId);
          this.resetCurrentGame();
          resolve();
        })
        .catch(error => reject(error));
    });
  }

  postGameAsScoresheet(scoresheet, tournamentId) {
    return this.$q((resolve, reject) => {
      const formattedGame = MatchService.formatGame(scoresheet);
      this.MatchHttpService.postMatch(tournamentId, formattedGame)
        .then((match) => {
          this.getGames(tournamentId);
          resolve(match);
        })
        .catch(error => reject(error));
    })
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
        .then((game) => {
          const formatted = {
            editing: false,
            addedBy: game.added_by,
            id: game.match_id,
            tuh: game.tossups_heard,
            moderator: game.moderator,
            notes: game.notes,
            packet: game.packet,
            room: game.room,
            round: game.round,
            teams: game.teams.map(team => (
              {
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
              }
            )),
            phases: game.phases.map(phase => (
              {
                id: phase.phase_id,
                name: phase.phase_name,
              }
            )),
          };
          this.setLoadedGameTeams(formatted);
          angular.copy(formatted, this.loadedGame);
          angular.copy(formatted, this.loadedGameOriginal);
          resolve();
        })
        .catch(error => reject(error));
    });
  }

  editLoadedGame(tournamentId) {
    return this.$q((resolve, reject) => {
      this.editGame(tournamentId, this.loadedGame.id, this.loadedGame)
        .then((match) => {
          this.loadedGame.editing = false;
          angular.copy(this.loadedGame, this.loadedGameOriginal);
          resolve(match);
        })
        .catch(error => reject(error));
    });
  }

  deleteLoadedGame(tournamentId) {
    return this.$q((resolve, reject) => {
      this.deleteGame(tournamentId, this.loadedGame.id)
        .then(() => {
          angular.copy({}, this.loadedGameOriginal);
          this.getGames(tournamentId);
          this.resetLoadedGame();
          resolve();
        })
        .catch(err => reject(err));
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
        .then(players => resolve(players.map(p => (
          {
            id: p.player_id,
            name: p.player_name,
          }
        ))))
        .catch(error => reject(error));
    });
  }

  addTeamToCurrentGame(tournamentId, team) {
    return this.$q((resolve, reject) => {
      this.getTeamPlayers(tournamentId, team.teamInfo.id)
        .then((players) => {
          const { pointScheme, rules } = this.TournamentService;
          const maxActive = rules.maxActive;
          const pointMap = pointScheme.tossupValues.reduce((aggr, tv) => {
            aggr[tv.value] = 0;
            return aggr;
          }, {});
          const formatted = players.map((player, index) => ({
            ...player,
            points: Object.assign({}, pointMap),
            tuh: index < maxActive ? 20 : 0,
          }));
          angular.copy(formatted, team.players);
          resolve(players);
        })
        .catch(err => reject(err));
    });
  }

  emptyLoadedGame() {
    angular.copy({}, this.loadedGame);
    angular.copy({}, this.loadedGameOriginal);
  }

  resetLoadedGame() {
    angular.copy(this.loadedGameOriginal, this.loadedGame);
  }

  resetLoadedGamePhases() {
    const loadedGamePhaseMap = this.loadedGame.phases.reduce((aggr, current) => {
      aggr[current.id] = true;
      return aggr;
    }, {});
    return this.phases.filter(phase => loadedGamePhaseMap[phase.id] === true);
  }

  setLoadedGameTeams(loadedGame) {
    loadedGame.teams.forEach((matchTeam) => {
      const index = this.teams.findIndex(team => team.id === matchTeam.id);
      if (index !== -1) {
        matchTeam.teamInfo = this.teams[index];
      }
    });
  }

  resetCurrentGame() {
    const game = MatchService.newGame();
    angular.copy(game, this.currentGame);
  }

  removeMatchFromArray(matchId) {
    const index = this.games.findIndex(game => game.id === matchId);
    if (index !== -1) {
      this.games.splice(index, 1);
    }
  }

  static newGame() {
    return {
      teams: [
        {
          teamInfo: null,
          players: [],
          overtime: 0,
        },
        {
          teamInfo: null,
          players: [],
          overtime: 0,
        },
      ],
      phases: [],
      round: 1,
      tuh: 20,
      room: null,
      moderator: null,
      packet: null,
      notes: null,
    };
  }

  static formatGame(game) {
    const gameCopy = {};
    angular.copy(game, gameCopy);
    gameCopy.phases = gameCopy.phases.map(phase => phase.id);
    gameCopy.teams = gameCopy.teams.map(team => (
      {
        id: team.teamInfo.id,
        score: team.score,
        bouncebacks: team.bouncebacks,
        overtime: team.overtime,
        players: team.players.map(player => (
          {
            id: player.id,
            tuh: player.tuh || 0,
            points: Object.keys(player.points)
                .map(Number).map(pv => (
                  {
                    value: pv,
                    number: player.points[pv] || 0,
                  }
                )),
          }
        )),
      }
    ));
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
      phases }) => (
      {
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
      }
      ));
  }
}

MatchService.$inject = ['$q', 'TeamService', 'TournamentService', 'MatchHttpService'];
