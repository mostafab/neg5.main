export default class ScoresheetCycleController {
  constructor($scope, ScoresheetService, TeamService, TournamentService, ScoresheetCycleService,
    ScoresheetPointsTrackerService, PhaseService) {

    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TeamService = TeamService;
    this.TournamentService = TournamentService;
    this.ScoresheetCycleService = ScoresheetCycleService;
    this.ScoresheetPointsTrackerService = ScoresheetPointsTrackerService;

    this.game = this.ScoresheetService.game;
    this.teams = this.TeamService.teams;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
    this.$scope.tournamentId = this.$scope.$parent.tournamentId;

    this.swapPlayers = this.ScoresheetCycleService.swapPlayers.bind(this.ScoresheetCycleService);
    this.getNumberOfActivePlayers =
      this.ScoresheetCycleService.getNumberOfActivePlayers.bind(this.ScoresheetCycleService);

    this.getTeamScoreUpToCycle =
      this.ScoresheetPointsTrackerService.getTeamScoreUpToCycle
        .bind(this.ScoresheetPointsTrackerService);

    this.getTeamThatGotTossup =
      this.ScoresheetCycleService.getTeamThatGotTossup.bind(this.ScoresheetCycleService);
    this.setTeamThatGotBonusPartCurrentCycle =
      this.ScoresheetCycleService.setTeamThatGotBonusPartCurrentCycle
        .bind(this.ScoresheetCycleService);

    this.teamDidNotNegInCycle =
      this.ScoresheetCycleService.teamDidNotNegInCycle.bind(this.ScoresheetCycleService);
    this.removeTeamNegsFromCycle =
      this.ScoresheetCycleService.removeTeamNegsFromCycle.bind(this.ScoresheetCycleService);
    this.removeLastAnswerFromCycle =
      this.ScoresheetCycleService.removeLastAnswerFromCycle.bind(this.ScoresheetCycleService);
    this.addPlayerAnswerToCurrentCycle =
      this.ScoresheetCycleService.addPlayerAnswerToCurrentCycle.bind(this.ScoresheetCycleService);
    this.teamDidNotAnswerInCycle =
      this.ScoresheetCycleService.teamDidNotAnswerInCycle.bind(this.ScoresheetCycleService);

    this.switchToBonusIfTossupGotten =
      this.ScoresheetCycleService.switchToBonusIfTossupGotten.bind(this.ScoresheetCycleService);
    this.nextCycle =
      this.ScoresheetCycleService.nextCycle
        .bind(this.ScoresheetCycleService, this.$scope.tournamentId);
    this.lastCycle =
      this.ScoresheetCycleService.lastCycle
        .bind(this.ScoresheetCycleService, this.$scope.tournamentId);
    this.switchCurrentCycleContext =
      this.ScoresheetCycleService.switchCurrentCycleContext.bind(this.ScoresheetCycleService);

    this.incrementActivePlayersTUH =
      this.ScoresheetCycleService.incrementActivePlayersTUH.bind(this.ScoresheetCycleService);

    this.scoresheetSelectGroup = this.ScoresheetCycleService.scoresheetSelectGroup.bind(this.ScoresheetCycleService);
  }

  loadTeamPlayers(team) {
    this.ScoresheetService.loadTeamPlayers(this.$scope.tournamentId, team);
  }
}

ScoresheetCycleController.$inject = [
  '$scope',
  'ScoresheetService',
  'TeamService',
  'TournamentService',
  'ScoresheetCycleService',
  'ScoresheetPointsTrackerService',
];
