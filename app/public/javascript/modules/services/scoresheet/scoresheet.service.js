import angular from 'angular';
import ScoresheetPointsTrackerService from './scoresheet-points-tracker.service';

export default class ScoresheetService {
  constructor($q, TournamentService, TeamHttpService, PhaseService, MatchService, TeamService) {
    this.$q = $q;
    this.TournamentService = TournamentService;
    this.PhaseService = PhaseService;
    this.MatchService = MatchService;
    this.TeamService = TeamService;
    this.TeamHttpService = TeamHttpService;
    this.ScoresheetPointsTrackerService =
      new ScoresheetPointsTrackerService(this, this.TournamentService);

    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
    this.phases = this.PhaseService.phases;
    this.game = ScoresheetService.newScoresheet();
  }

  loadTeamPlayers(tournamentId, team) {
    return this.$q((resolve, reject) => {
      const { id } = team.teamInfo;
      this.TeamHttpService.getTeamById(tournamentId, id)
        .then(({ players }) => {
          const formatted = players.map((p, index) => ({
            id: p.player_id,
            name: p.player_name,
            active: index < this.rules.maxActive,
            tuh: 0,
          }));
          angular.copy(formatted, team.players);
          resolve(formatted);
        })
        .catch(err => reject(err));
    });
  }

  addPlayer(tournamentId, team) {
    const { length } = team.newPlayer;
    if (length > 0) {
      this.TeamService.addPlayer(tournamentId, team.teamInfo.id, team.newPlayer)
        .then((player) => {
          team.players.push({
            name: player.name,
            id: player.id,
            tuh: 0,
            active: team.players.length + 1 <= this.rules.maxActive,
          });
          team.newPlayer = '';
        });
    }
  }

  getTeam(teamId) {
    if (teamId) {
      return this.game.teams.find(team => team.teamInfo.id === teamId);
    }
    return null;
  }

  resetScoresheet() {
    const copy = ScoresheetService.newScoresheet();
    angular.copy(copy, this.game);
  }

  saveScoresheet(tournamentId) {
    if (!tournamentId) {
      throw new Error('tournamentId param required.');
    }
    this.game.lastSavedAt = new Date();
    localStorage.setItem(`scoresheet_${tournamentId}`,
      JSON.stringify(this.game));
  }

  revertScoresheetSubmission(tournamentId) {
    const matchId = this.game.id;
    return this.$q((resolve, reject) => {
      if (matchId) {
        this.MatchService.deleteGame(tournamentId, matchId)
          .then(() => {
            this.game.id = null;
            this.game.submitted = false;
            resolve();
          })
          .catch(error => reject(error));
      } else {
        resolve();
      }
    });
  }

  submitScoresheet(tournamentId) {
    return this.$q((resolve, reject) => {
      if (!this.game.submitted) {
        const parsedScoresheet = this.parseScoresheet(this.game);
        this.MatchService.postGameAsScoresheet(parsedScoresheet, tournamentId)
          .then((match) => {
            this.game.id = match[0].id; 
            this.game.submitted = true;
            this.saveScoresheet(tournamentId);
            resolve();
          })
          .catch(err => reject(err));
      }
    })
  }

  parseScoresheet(scoresheet) {
    return {
      moderator: scoresheet.moderator,
      notes: scoresheet.notes,
      packet: scoresheet.packet,
      phases: scoresheet.phases,
      room: scoresheet.room,
      round: scoresheet.round,
      serialId: scoresheet.serialId,
      tuh: scoresheet.currentCycle.number - 1,
      teams: scoresheet.teams.map((team) => {
        return {
          teamInfo: team.teamInfo,
          players: team.players.filter(p => p.tuh > 0).map((player) => {
            return {
              id: player.id,
              tuh: player.tuh,
              points: this.pointScheme.tossupValues.reduce((aggr, tv) => {
                aggr[tv.value] = this.ScoresheetPointsTrackerService
                  .getNumberOfTossupTypeForPlayer(scoresheet, player, tv);
                return aggr;
              }, {}),
            };
          }),
          score: this.ScoresheetPointsTrackerService
            .getTeamScoreUpToCycle(scoresheet, team.teamInfo.id, scoresheet.currentCycle.number - 1),
          bouncebacks: this.ScoresheetPointsTrackerService.getTeamBouncebacks(scoresheet, team.teamInfo.id),
          overtime: team.overtime || 0,
        };
      }),
      scoresheet: scoresheet.cycles.filter((c, index) =>
        index < scoresheet.currentCycle.number - 1).map((c, index) => {
          return {
            number: index + 1,
            answers: c.answers,
            bonuses: ScoresheetService.makeArray(this.pointScheme.partsPerBonus)
              .map((elem, innerIndex) => {
                return {
                  part: innerIndex + 1,
                  teamThatGotBonus: c.bonuses[innerIndex] || null,
                };
              }),
          };
        }),
    };
  }

  static makeArray(length) {
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr[i] = undefined;
    }
    return arr;
  }

  range(num) {
    return new Array(num);
  }

  static newScoresheet() {
    return {
      teams: [
        {
          teamInfo: null,
          players: [],
          newPlayer: '',
          overtime: 0,
        },
        {
          teamInfo: null,
          players: [],
          newPlayer: '',
          overtime: 0,
        },
      ],
      cycles: ScoresheetService.initializeCyclesArray(20),
      currentCycle: {
        number: 1,
        answers: [],
        bonuses: [],
      },
      onTossup: true,
      round: null,
      packet: null,
      notes: null,
      moderator: null,
      phases: [],
      room: null,
      serialId: null,
    };
  }

  static initializeCyclesArray(n) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        answers: [],
        bonuses: [],
      });
    }
    return arr;
  }
}

ScoresheetService.$inject = [
  '$q',
  'TournamentService',
  'TeamHttpService',
  'PhaseService',
  'MatchService',
  'TeamService',
];


