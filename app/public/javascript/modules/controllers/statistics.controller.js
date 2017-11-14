export default class StatisticsController {
  constructor($scope, QBJService) {
    this.$scope = $scope;
    this.QBJService = QBJService;

    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
  }

  downloadQBJ() {
    const formatted = this.$scope.tournamentInfo.name.replace(/ /g, '_').toLowerCase();
    this.QBJService.downloadQBJ(this.$scope.tournamentId, formatted);
  }
}

StatisticsController.$inject = ['$scope', 'QBJService'];
