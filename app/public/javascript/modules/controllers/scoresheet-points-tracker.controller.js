export default class ScoresheetPointsTrackerController {
  constructor($scope, ScoresheetService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.game = this.ScoresheetService.game;
  }
}

ScoresheetPointsTrackerController.$inject = ['$scope', 'ScoresheetService'];