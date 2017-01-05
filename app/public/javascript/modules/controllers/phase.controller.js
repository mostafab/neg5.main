export default class PhaseController {
  constructor($scope, PhaseService) {
    this.$scope = $scope;
    this.PhaseService = PhaseService;

    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
    this.newPhase = this.PhaseService.newPhase;
    this.phases = this.PhaseService.phases;
    this.activePhase = this.PhaseService.activePhase;

    this.PhaseService.getPhases(this.$scope.tournamentId);
  }
}

PhaseController.$inject = ['$scope', 'PhaseService'];
