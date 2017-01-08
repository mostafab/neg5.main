export default class ScoresheetCycleController {
  constructor($scope, ScoresheetService, TeamService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TeamService = TeamService;
    this.game = this.ScoresheetService.game;
    this.teams = this.TeamService.teams;
  }
}

ScoresheetCycleController.$inject = ['$scope', 'ScoresheetService', 'TeamService'];
