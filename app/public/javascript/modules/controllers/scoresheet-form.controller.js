import angular from 'angular';

export default class ScoresheetFormController {
  constructor($scope, ScoresheetService, TournamentService, TeamService) {
    this.$scope = $scope;
    this.ScoresheetService = ScoresheetService;
    this.TournamentService = TournamentService;
    this.TeamService = TeamService;
    this.game = this.ScoresheetService.game;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;

    this.resetScoresheet = this.ScoresheetService.resetScoresheet;
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

  getTeam(teamId) {
    if (teamId) {
      return this.game.teams.find(team => team.teamInfo.id === teamId);
    }
    return null;
  }

  range(num) {
    return new Array(num);
  }

  loadLastSavedScoresheet() {
    const lastScoresheet = localStorage.getItem(`scoresheet_${this.$scope.tournamentId}`);
    if (!lastScoresheet) {
      this.$scope.toast({
        message: 'No prior saved scoresheet',
        success: false,
        hideAfter: true,
      });
    } else {
      try {
        angular.copy(JSON.parse(lastScoresheet), this.game);
      } catch (err) {
        this.$scope.toast({
          message: 'Could not read scoresheet.',
          success: false,
          hideAfter: true,
        });
      }
    }
  }
}

ScoresheetFormController.$inject = ['$scope', 'ScoresheetService', 'TournamentService', 'TeamService'];
