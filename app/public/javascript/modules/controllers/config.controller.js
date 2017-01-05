export default class ConfigurationController {
  constructor($scope, $timeout, TournamentService, MatchService) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.TournamentService = TournamentService;
    this.MatchService = MatchService;

    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
    this.pointSchemeCopy = this.TournamentService.pointSchemeCopy;
    this.rulesCopy = this.TournamentService.rulesCopy;
    this.newPointValue = this.TournamentService.newPointValue;
    this.games = this.MatchService.games;

    this.editingPointScheme = false;
    this.editingRules = false;

    this.resetPointSchemeCopyToOriginal = this.TournamentService.resetPointSchemeCopyToOriginal;
    this.resetRules = this.TournamentService.resetRules;

    this.$timeout(() => {
      this.resetPointSchemeCopyToOriginal();
      this.resetRules();
    }, 500);
  }
}

ConfigurationController.$inject = ['$scope', '$timeout', 'TournamentService', 'MatchService'];
