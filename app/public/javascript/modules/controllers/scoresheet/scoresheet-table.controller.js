export default class ScoresheetTableController {
  constructor($scope, ScoresheetService, TeamService, TournamentService, ScoresheetTableService,
    ScoresheetPointsTrackerService) {

    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TeamService = TeamService;
    this.TournamentService = TournamentService;
    this.ScoresheetTableService = ScoresheetTableService;
    this.ScoresheetPointsTrackerService = ScoresheetPointsTrackerService;
    this.game = this.ScoresheetService.game;
    this.teams = this.TeamService.teams;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
    this.$scope.tournamentId = this.$scope.$parent.tournamentId;

    this.getTeamBonusPointsForCycle =
      this.ScoresheetPointsTrackerService.getTeamBonusPointsForCycle
        .bind(this.ScoresheetPointsTrackerService);
    this.getTeamThatGotTossup = this.ScoresheetPointsTrackerService.getTeamThatGotTossup
      .bind(this.ScoresheetPointsTrackerService);
    this.getTeamScoreUpToCycle = this.ScoresheetPointsTrackerService.getTeamScoreUpToCycle
      .bind(this.ScoresheetPointsTrackerService);
    this.getTeamBouncebacks = this.ScoresheetPointsTrackerService.getTeamBouncebacks
      .bind(this.ScoresheetPointsTrackerService);

    this.setTeamThatGotBonusPartCurrentCycle =
      this.ScoresheetTableService.setTeamThatGotBonusPartCurrentCycle
        .bind(this.ScoresheetTableService);
    this.editCycleBonuses = this.ScoresheetTableService.editCycleBonuses
      .bind(this.ScoresheetTableService);

    this.displayPlayerAnswerForCycle = this.ScoresheetTableService.displayPlayerAnswerForCycle
      .bind(this.ScoresheetTableService);
    this.displayCycleBonuses = this.ScoresheetTableService.displayCycleBonuses
      .bind(this.ScoresheetTableService);

    this.getPlayerAnswerForCycle = this.ScoresheetPointsTrackerService.getPlayerAnswerForCycle
      .bind(this.ScoresheetPointsTrackerService);
    this.editPlayerAnswerForCycle = this.ScoresheetTableService.editPlayerAnswerForCycle
      .bind(this.ScoresheetTableService);

    this.cycleHasCorrectAnswer = this.ScoresheetPointsTrackerService.cycleHasCorrectAnswer
      .bind(this.ScoresheetPointsTrackerService);
    this.teamAnsweredTossupCorrectly =
      this.ScoresheetPointsTrackerService.teamAnsweredTossupCorrectly
        .bind(this.ScoresheetPointsTrackerService);
  }
}

ScoresheetTableController.$inject = [
  '$scope',
  'ScoresheetService',
  'TeamService',
  'TournamentService',
  'ScoresheetTableService',
  'ScoresheetPointsTrackerService',
];
