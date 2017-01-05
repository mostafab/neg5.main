export default class MatchController {
  constructor($scope, MatchService, TournamentService, TeamService, PhaseService, MatchUtilFactory) {
    this.$scope = $scope;
    this.MatchService = MatchService;
    this.TournamentService = TournamentService;
    this.TeamService = TeamService;
    this.PhaseService = PhaseService;
    this.MatchUtil = MatchUtilFactory(this);

    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
    this.$scope.toast = this.$scope.$parent.toast;

    this.teams = this.TeamService.teams;
    this.games = this.MatchService.games;
    this.phases = this.PhaseService.phases;
    this.currentGame = this.MatchService.currentGame;
    this.loadedGame = this.MatchService.loadedGame;
    this.loadedGameOriginal = this.MatchService.loadedGame;

    this.sortType = 'round';
    this.sortReverse = false;
    this.gameQuery = '';

    this.resetLoadedGame = MatchService.resetLoadedGame;
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;

    this.MatchService.getGames(this.$scope.tournamentId);
  }

  addGame() {
    if (this.newGameForm.$valid) {
      this.MatchService.postGame(this.$scope.tournamentId);
    }
  }

  resetForm() {
    this.MatchService.resetCurrentGame();
    this.newGameForm.$setUntouched();
  }

  editLoadedGame() {
    this.MatchService.editLoadedGame(this.$scope.tournamentId);
  }

  deleteGame() {
    this.MatchService.deleteLoadedGame(this.$scope.tournamentId);
  }

  addTeam(team) {
    this.MatchService.addTeamToCurrentGame(this.$scope.tournamentId, team);
  }

  matchSearch(match) {
    const normalizedQuery = this.gameQuery.toLowerCase();
    const { round, teams } = match;
    const teamOneName = teams.one.name.toLowerCase();
    const teamTwoName = teams.two.name.toLowerCase();

    return round == normalizedQuery
        || teamOneName.indexOf(normalizedQuery) !== -1
        || teamTwoName.indexOf(normalizedQuery) !== -1;
  }

  static setLoadedGameTeams(loadedGame, teams) {
    loadedGame.teams.forEach((matchTeam) => {
      const index = teams.findIndex(team => team.id === matchTeam.id);
      if (index !== -1) {
        matchTeam.teamInfo = teams[index];
      }
    });
  }

  static buildTeamMap(teams) {
    return teams.reduce((aggr, current) => {
      aggr[current.id] = current;
      return aggr;
    }, {});
  }
}

MatchController.$inject = ['$scope', 'MatchService', 'TournamentService', 'TeamService', 'PhaseService', 'MatchUtilFactory'];
