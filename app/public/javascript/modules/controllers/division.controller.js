export default class DivisionController {
  constructor($scope, DivisionService, PhaseService) {
    this.$scope = $scope;
    this.DivisionService = DivisionService;
    this.PhaseService = PhaseService;
    this.divisions = this.DivisionService.divisions;
    this.phases = this.PhaseService.phases;

    this.newDivision = this.DivisionService.newDivision;
  }

  addNewDivision() {
    console.log(this.newDivision);
  }
}

DivisionController.$inject = ['$scope', 'DivisionService', 'PhaseService'];
