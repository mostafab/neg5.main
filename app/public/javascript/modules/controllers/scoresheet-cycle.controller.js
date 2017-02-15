export default class ScoresheetCycleController {
  constructor($scope, ScoresheetService, TeamService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TeamService = TeamService;
    this.game = this.ScoresheetService.game;
    this.teams = this.TeamService.teams;

    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
  }

  loadTeamPlayers(team) {
    this.ScoresheetService.loadTeamPlayers(this.$scope.tournamentId, team)
      .then((players) => {

      })
      .catch(err => {

      })
      .finally(() => {

      });
  }
}

ScoresheetCycleController.$inject = ['$scope', 'ScoresheetService', 'TeamService'];
