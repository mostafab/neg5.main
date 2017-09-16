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
    if (this.game.submitted) {
      this.ScoresheetService.revertScoresheetSubmission(this.$scope.tournamentId);
    }
  }

  submitScoresheet() {
    if (this.scoresheetForm.$valid && !this.game.submitted) {
      this.$scope.toast({
        message: 'Submitting scoresheet.',
      });
      this.ScoresheetService.submitScoresheet(this.$scope.tournamentId)
        .then(() => {
          this.$scope.toast({
            message: 'Successfully submitted scoresheet.',
            success: true,
            hideAfter: true,
          });
        })
        .catch(() => {
          this.$scope.toast({
            message: 'Could not submit scoresheet.',
            success: false,
            hideAfter: true,
          });
        })
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
}

ScoresheetFormController.$inject = [
  '$scope',
  'ScoresheetService',
  'TournamentService',
  'TeamService',
  'PhaseService',
];
