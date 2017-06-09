import angular from 'angular';

export default class ScoresheetFormController {
  constructor($scope, ScoresheetService, TournamentService, TeamService, PhaseService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TournamentService = TournamentService;
    this.TeamService = TeamService;
    this.PhaseService = PhaseService;
    this.phases = this.PhaseService.phases;
    this.game = this.ScoresheetService.game;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;

    this.getTeam = this.ScoresheetService.getTeam.bind(this.ScoresheetService);
    this.resetScoresheet = this.ScoresheetService.resetScoresheet.bind(this.ScoresheetService);

    this.range = this.ScoresheetService.range.bind(this.ScoresheetService);
  }

  addPlayer(team) {
    this.ScoresheetService.addPlayer(this.$scope.tournamentId, team);
  }

  revertScoresheetSubmission() {
    this.ScoresheetService.revertScoresheetSubmission(this.$scope.tournamentId);
  }

  submitScoresheet() {
    if (this.scoresheetForm.$valid && !this.game.submitted) {
      const parsedScoresheet = this.parseScoresheet(this.game);
    }
  }

  loadLastSavedScoresheet() {
    const lastScoresheet = localStorage.getItem(`scoresheet_${this.$scope.tournamentId}`);
    if (!lastScoresheet) {
      this.$scope.toast({
        message: 'No prior saved scoresheet',
        success: false,
        hideAfter: true,
      });
    } else {
      try {
        angular.copy(JSON.parse(lastScoresheet), this.game);
      } catch (err) {
        this.$scope.toast({
          message: 'Could not read scoresheet.',
          success: false,
          hideAfter: true,
        });
      }
    }
  }

  parseScoresheet(scoresheet) {
    return {
      moderator: scoresheet.moderator,
      notes: scoresheet.notes,
      packet: scoresheet.packet,
      phases: scoresheet.phases,
      room: scoresheet.room,
      round: scoresheet.round,
      tuh: scoresheet.currentCycle.number - 1,
      teams: scoresheet.teams.map((team) => {
        return {
          teamInfo: team.teamInfo,
          players: team.players.filter(p => p.tuh > 0).map((player) => {
            return {
              id: player.id,
              tuh: player.tuh,
              points: this.pointScheme.tossupValues.reduce((aggr, tv) => {
                aggr[tv.value] = this.getNumberOfTossupTypeForPlayer(player, tv);
                return aggr;
              }, {}),
            };
          }),
          score: this.getTeamScoreUpToCycle(team.teamInfo.id, scoresheet.currentCycle.number - 1),
          bouncebacks: this.getTeamBouncebacks(team.teamInfo.id),
          overtime: team.overtime || 0,
        };
      }),
      scoresheet: scoresheet.cycles.filter((c, index) =>
        index < scoresheet.currentCycle.number - 1).map((c, index) => {
          return {
            number: index + 1,
            answers: c.answers,
            bonuses: ScoresheetFormController.makeArray(this.pointScheme.partsPerBonus).map((elem, innerIndex) => {
              return {
                part: innerIndex + 1,
                teamThatGotBonus: c.bonuses[innerIndex] || null,
              }
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

}

ScoresheetFormController.$inject = [
  '$scope',
  'ScoresheetService',
  'TournamentService',
  'TeamService',
  'PhaseService',
];
