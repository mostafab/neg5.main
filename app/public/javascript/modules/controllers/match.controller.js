import $ from 'jquery';

const DELETE_MATCH_MODAL = '#deleteMatchModal';

export default class MatchController {
  constructor($scope, MatchService, TournamentService, TeamService,
    PhaseService, MatchUtilFactory) {
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
    this.loadedGameOriginal = this.MatchService.loadedGameOriginal;
    this.emptyLoadedGame = this.MatchService.emptyLoadedGame;

    this.sortType = 'round';
    this.sortReverse = false;
    this.gameQuery = '';

    this.resetLoadedGame = MatchService.resetLoadedGame.bind(this.MatchService);
    this.pointScheme = this.TournamentService.pointScheme;
    this.rules = this.TournamentService.rules;

    this.savingNewGame = false;
    this.savingOldGame = false;

    this.MatchService.getGames(this.$scope.tournamentId);
  }

  getGames() {
    this.MatchService.getGames(this.$scope.tournamentId);
  }

  addGame() {
    if (this.newGameForm.$valid) {
      const toastConfig = {
        message: 'Adding match',
      };
      this.savingNewGame = true;
      this.$scope.toast(toastConfig);
      this.MatchService.postGame(this.$scope.tournamentId)
        .then(() => {
          toastConfig.message = 'Added match';
          toastConfig.success = true;
          this.resetForm();
        })
        .catch(() => {
          toastConfig.message = 'Could not add match';
          toastConfig.success = false;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.$scope.toast(toastConfig);
          this.savingNewGame = false;
        });
    }
  }

  loadGame(gameId) {
    const toastConfig = {
      message: 'Loading match',
    };
    // this.$scope.toast(toastConfig);
    this.MatchService.getGameById(this.$scope.tournamentId, gameId)
      .then(() => {
        toastConfig.message = 'Loaded match';
        toastConfig.success = true;
      })
      .catch(() => {
        toastConfig.message = 'Could not load match';
        toastConfig.success = false;
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }

  resetForm() {
    this.MatchService.resetCurrentGame();
    this.newGameForm.$setUntouched();
  }

  editLoadedGame() {
    const toastConfig = {
      message: 'Editing match',
    };
    this.$scope.toast(toastConfig);
    this.savingOldGame = true;
    this.MatchService.editLoadedGame(this.$scope.tournamentId)
      .then(() => {
        toastConfig.success = true;
        toastConfig.message = 'Edited match';
      })
      .catch(() => {
        toastConfig.success = false;
        toastConfig.message = 'Could not edit match';
      })
      .finally(() => {
        this.savingOldGame = false;
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
      });
  }

  deleteGame() {
    this.deletingMatch = true;
    const toastConfig = {
      message: 'Deleting match.',
    };
    this.MatchService.deleteLoadedGame(this.$scope.tournamentId)
      .then(() => {
        toastConfig.success = true;
        toastConfig.message = 'Deleted match';
      })
      .catch(() => {
        toastConfig.success = false;
        toastConfig.message = 'Could not delete match';
      })
      .finally(() => {
        toastConfig.hideAfter = true;
        this.$scope.toast(toastConfig);
        this.deletingMatch = false;
        $(DELETE_MATCH_MODAL).modal('hide');
      });
  }

  addTeam(team) {
    this.MatchService.addTeamToCurrentGame(this.$scope.tournamentId, team);
  }

  static buildTeamMap(teams) {
    return teams.reduce((aggr, current) => {
      aggr[current.id] = current;
      return aggr;
    }, {});
  }
}

MatchController.$inject = ['$scope', 'MatchService', 'TournamentService', 'TeamService', 'PhaseService', 'MatchUtilFactory'];
