export default class PhaseController {
  constructor($scope, PhaseService) {
    this.$scope = $scope;
    this.PhaseService = PhaseService;

    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
    this.$scope.toast = this.$scope.$parent.toast;
    this.newPhase = this.PhaseService.newPhase;
    this.phases = this.PhaseService.phases;
    this.activePhase = this.PhaseService.activePhase;

    this.PhaseService.getPhases(this.$scope.tournamentId);
  }

  addPhase() {
    const config = {
      message: 'Adding new phase.',
    };
    this.$scope.toast(config);
    this.PhaseService.postPhase(this.$scope.tournamentId)
      .then((phaseName) => {
        config.success = true;
        config.message = `Added phase: ${phaseName}`;
      })
      .catch((err = {}) => {
        config.success = false;
        config.message = err.reason || 'Could not add new phase.';
      })
      .finally(() => {
        config.hideAfter = true;
        this.$scope.toast(config);
      });
  }

  /* eslint-disable no-param-reassign */
  editPhase(phase) {
    if (phase.name.trim() !== phase.newName.trim()) {
      const toastConfig = {
        message: `Editing phase: ${phase.name} \u2192 ${phase.newName}`,
      };
      this.$scope.toast(toastConfig);
      this.PhaseService.editPhase(this.$scope.tournamentId, phase)
        .then((newName) => {
          toastConfig.message = `Updated phase to ${newName}.`;
          toastConfig.success = true;
          phase.editing = false;
        })
        .catch((err = {}) => {
          toastConfig.message = err.reason || 'Unable to update phase.';
          toastConfig.success = false;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
        });
    } else {
      phase.editing = false;
    }
  }

  removePhase(phase) {
    const toastConfig = {
      message: `Removing phase: ${phase.name}`,
    };
    this.$scope.toast(toastConfig);
    this.PhaseService.deletePhase(this.$scope.tournamentId, phase.id)
      .then((phaseName) => {
        toastConfig.message = `Removed phase: ${phaseName}`;
        toastConfig.success = true;
      })
      .catch(() => {
        toastConfig.message = 'Could not remove phase.';
        toastConfig.success = false;
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }

  updateActivePhase(phase) {
    this.PhaseService.updateActivePhase(this.$scope.tournamentId, phase.id)
      .catch((err = {}) => {
        this.$scope.toast({
          message: err.reason || 'Could not update active phase.',
          success: false,
          hideAfter: true,
        });
      });
  }
}

PhaseController.$inject = ['$scope', 'PhaseService'];
