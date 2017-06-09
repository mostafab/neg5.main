export default class ScoresheetPointsTrackerController {
  constructor($scope, ScoresheetService, TournamentService, ScoresheetPointsTrackerService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TournamentService = TournamentService;
    this.ScoresheetPointsTrackerService = ScoresheetPointsTrackerService;
    this.game = this.ScoresheetService.game;
    this.pointScheme = this.TournamentService.pointScheme;

    this.getPlayerTotalPoints =
      this.ScoresheetPointsTrackerService.getPlayerTotalPoints
        .bind(this.ScoresheetPointsTrackerService);

    this.getNumberOfTossupTypeForPlayer =
      this.ScoresheetPointsTrackerService.getNumberOfTossupTypeForPlayer
        .bind(this.ScoresheetPointsTrackerService);

    this.getNumberOfAnswersForPlayer =
      this.ScoresheetPointsTrackerService.getNumberOfAnswersForPlayer
        .bind(this.ScoresheetPointsTrackerService);
  }
}

ScoresheetPointsTrackerController.$inject = [
  '$scope',
  'ScoresheetService',
  'TournamentService',
  'ScoresheetPointsTrackerService',
];
