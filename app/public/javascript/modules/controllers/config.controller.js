export default class ConfigurationController {
  constructor($scope, $timeout, TournamentService, MatchService, PhaseService) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.TournamentService = TournamentService;
    this.MatchService = MatchService;
    this.PhaseService = PhaseService;
    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
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
    this.minTossupValue = this.TournamentService.minTossupValue;
    this.maxTossupValue = this.TournamentService.maxTossupValue;

    this.phases = this.PhaseService.phases;

    this.$timeout(() => {
      this.resetPointSchemeCopyToOriginal();
      this.resetRules();
    }, 500);
  }

  saveRules() {
    const { $valid } = this.editConfigurationRules;
    if ($valid) {
      if (this.TournamentService.rulesChanged()) {
        const toastConfig = {
          message: 'Updating rules',
        };
        this.$scope.toast(toastConfig);
        this.TournamentService.saveRules(this.$scope.tournamentId)
          .then(() => {
            this.editingRules = false;
            toastConfig.success = true;
            toastConfig.message = 'Updated rules.';
          })
          .catch(() => {
            toastConfig.success = false;
            toastConfig.message = 'Could not update rules.';
          })
          .finally(() => {
            toastConfig.hideAfter = true;
            this.$scope.toast(toastConfig);
          });
      } else {
        this.resetRules();
        this.editingRules = false;
      }
    }
  }

  editPointScheme() {
    const { $valid } = this.editPointSchemeForm;
    if ($valid) {
      const toastConfig = {
        message: 'Editing point scheme',
      };
      this.$scope.toast(toastConfig);
      this.TournamentService.editPointScheme(this.$scope.tournamentId)
        .then(() => {
          this.editingPointScheme = false;
          toastConfig.message = 'Saved point values';
          toastConfig.success = true;
        })
        .catch((err = {}) => {
          toastConfig.message = err.reason || 'Could not update point values';
          toastConfig.success = false;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
        });
    }
  }

  addNewPointValue() {
    const { $valid } = this.newPointValueForm;
    if ($valid) {
      const toastConfig = {
        message: 'Adding new point value',
      };
      this.$scope.toast(toastConfig);
      this.TournamentService.addNewPointValue(this.$scope.tournamentId)
        .then(() => {
          toastConfig.success = true;
          toastConfig.message = 'Added new point value';
        })
        .catch((err = {}) => {
          toastConfig.success = false;
          toastConfig.message = err.reason || 'Could not add point value';
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
        });
    }
  }
}

ConfigurationController.$inject = ['$scope', '$timeout', 'TournamentService', 'MatchService', 'PhaseService'];
