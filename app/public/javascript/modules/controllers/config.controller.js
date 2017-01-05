export default class ConfigurationController {
  constructor($scope, $timeout, TournamentService, MatchService) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.TournamentService = TournamentService;
    this.MatchService = MatchService;

    this.$scope.toast = this.$scope.$parent.toast;

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
    this.removeFromPointSchemeCopy = this.TournamentService.removeFromPointSchemeCopy;

    this.$timeout(() => {
      this.resetPointSchemeCopyToOriginal();
      this.resetRules();
    }, 500);
  }

  saveRules() {
    const { $valid } = this.editConfigurationRules;
    // if ($valid) {
    //   const toastConfig = {
    //     message: 'Updating rules',
    //   };
    //   this.$scope.toast(toastConfig);
    // } else {
    //   this.resetRules();
    //   this.editingRules = false;
    // }
    if ($valid) {
      const generator = this.TournamentService.saveRules();
      const canContinue = generator.next().value;
      if (canContinue) {
        const res = generator.next(this.$scope.tournamentId).value;
        console.log(res);
      }
    }
  }
}

ConfigurationController.$inject = ['$scope', '$timeout', 'TournamentService', 'MatchService'];
