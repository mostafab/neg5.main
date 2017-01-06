export default class DivisionController {
  constructor($scope, DivisionService, PhaseService) {
    this.$scope = $scope;
    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
    this.$scope.toast = this.$scope.$parent.toast;
    this.DivisionService = DivisionService;
    this.PhaseService = PhaseService;
    this.divisions = this.DivisionService.divisions;
    this.phases = this.PhaseService.phases;

    this.newDivision = this.DivisionService.newDivision;

    this.getDivisions();
  }

  getDivisions() {
    this.DivisionService.getDivisions(this.$scope.tournamentId);
  }

  addNewDivision() {
    const toastConfig = {
      message: `Adding new division: ${this.newDivision.name}.`,
    };
    this.$scope.toast(toastConfig);
    this.DivisionService.addCurrentNewDivision(this.$scope.tournamentId)
      .then((newDivision) => {
        toastConfig.success = true;
        toastConfig.message = `Added division: ${newDivision.name}`;
      })
      .catch((err = {}) => {
        toastConfig.success = false;
        toastConfig.message = err.reason || 'Could not add division.';
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }

  /* eslint-disable no-param-reassign */
  saveDivision(division) {
    if (division.name.trim() !== division.newName.trim()
      && division.newName.length > 0) {
      const toastConfig = {
        message: `Updating division: ${division.name} \u2192 ${division.newName}`,
      };
      this.$scope.toast(toastConfig);
      this.DivisionService.editDivision(this.$scope.tournamentId, division)
        .then((newName) => {
          toastConfig.message = `Updating division to ${newName}`;
          toastConfig.success = true;
          division.editing = false;
        })
        .catch((err = {}) => {
          toastConfig.message = err.reason || 'Could not update division';
          toastConfig.success = false;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
        });
    } else {
      division.editing = false;
      division.newName = division.name;
    }
  }

  removeDivision(division) {
    const { name, id } = division;
    const toastConfig = {
      message: `Removing division: ${name}`,
    };
    this.$scope.toast(toastConfig);
    this.DivisionService.removeDivision(this.$scope.tournamentId, id)
      .then(() => {
        toastConfig.message = `Removed division: ${name}`;
        toastConfig.success = true;
      })
      .catch(() => {
        toastConfig.message = `Could not remove division ${name}`;
        toastConfig.success = false;
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }
}

DivisionController.$inject = ['$scope', 'DivisionService', 'PhaseService'];
