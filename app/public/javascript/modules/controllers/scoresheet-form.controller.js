export default class ScoresheetFormController {
  constructor($scope, ScoresheetService, TournamentService, TeamService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TournamentService = TournamentService;
    this.TeamService = TeamService;
    this.game = this.ScoresheetService.game;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;
  }

  addPlayer(team) {
    const { length } = team.newPlayer;
    if (length > 0) {
      this.TeamService.addPlayer(this.$scope.tournamentId, team.teamInfo.id, team.newPlayer)
        .then((player) => {
          team.players.push({
            name: player.name,
            id: player.id,
            tuh: 0,
            active: team.players.length + 1 <= this.rules.maxActive,
          });
          team.newPlayer = '';
        });
    }
  }
}

ScoresheetFormController.$inject = ['$scope', 'ScoresheetService', 'TournamentService', 'TeamService'];
