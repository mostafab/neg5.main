export default class ScoresheetFormController {
  constructor($scope, ScoresheetService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.game = this.ScoresheetService.game;
  }
}

ScoresheetFormController.$inject = ['$scope', 'ScoresheetService'];
