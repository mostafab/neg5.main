import angular from 'angular';

export default class MatchController {
  constructor($scope, MatchService, TournamentService) {
    this.$scope = $scope;
    this.MatchService = MatchService;
    this.TournamentService = TournamentService;

    this.$scope.tournamentId = this.$scope.$parent.tournamentId;
    this.$scope.toast = this.$scope.$parent.toast;

    this.teams = [];
    this.games = this.MatchService.games;
    this.phases = [];
    this.currentGame = MatchController.newGame();
    this.loadedGame = {};
    this.loadedGameOriginal = {};

    this.sortType = 'round';
    this.sortReverse = false;
    this.gameQuery = '';

    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;

    this.MatchService.getGames(this.$scope.tournamentId);
  }

  resetLoadedGame() {
    angular.copy(this.loadedGameOriginal, this.loadedGame);
  }

  resetForm() {
    this.currentGame = MatchController.newGame();
    this.newGameForm.$setUntouched();
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

  static resetLoadedGamePhases(loadedGame, tournamentPhases) {
    const loadedGamePhaseMap = loadedGame.phases.reduce((aggr, current) => {
      aggr[current.id] = true;
      return aggr;
    }, {});
    return tournamentPhases.filter(phase => loadedGamePhaseMap[phase.id] === true);
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

  static newGame() {
    return {
      teams: [
        {
          teamInfo: null,
          players: [],
          overtime: 0,
        },
        {
          teamInfo: null,
          players: [],
          overtime: 0,
        },
      ],
      phases: [],
      round: 1,
      tuh: 20,
      room: null,
      moderator: null,
      packet: null,
      notes: null,
    };
  }
}

MatchController.$inject = ['$scope', 'MatchService', 'TournamentService'];
