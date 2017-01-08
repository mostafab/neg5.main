export default class ScoresheetCycleController {
  constructor($scope, ScorehseetService, TeamService) {
    this.$scope = $scope;
    this.ScorehseetService = ScorehseetService;
    this.TeamService = TeamService;
    this.game = this.ScorehseetService.game;
    this.teams = this.TeamService.teams;
  }
}

ScoresheetCycleController.$inject = ['$scope', 'ScoresheetService', 'TeamService'];
