import angular from 'angular';

const validTabs = [
  'overview',
  'config',
  'collaborator',
  'match',
  'team',
  'statistics',
  'scoresheet'
];

const TOURNAMENT_TAB_KEY = 'nfTab';
const MATCH_TAB_KEY = 'matchTab';
const TEAM_TAB_KEY = 'teamTab';

export default class TournamentController {
  constructor($scope, $window, $timeout, $cookies, TournamentService, TeamService, MatchService, SlugService) {
    this.$scope = $scope;
    this.$window = $window;
    this.$timeout = $timeout;
    this.$cookies = $cookies;
    this.TournamentService = TournamentService;
    this.TeamService = TeamService;
    this.MatchService = MatchService;
    this.SlugService = SlugService;

    this.$scope.toastMessage = null;
    this.toastPromise = null;

    if (location.hash) {
      const tab = location.hash.substr(1);
      if (validTabs.indexOf(tab) !== -1) {
        this.tab = location.hash.substr(1);
      } else {
        this.tab = localStorage.getItem(TOURNAMENT_TAB_KEY) || 'overview';
      }
    } else {
      this.tab = localStorage.getItem(TOURNAMENT_TAB_KEY) || 'overview';
    }
    this.matchTab = localStorage.getItem(MATCH_TAB_KEY) || 'add';
    this.teamTab = localStorage.getItem(TEAM_TAB_KEY) || 'add';

    this.tournamentInfoCopy = {};
    this.editing = false;

    this.teams = this.TeamService.teams;
    this.games = this.MatchService.games;

    this.$scope.tournamentId = $window.location.pathname.split('/')[2];
    this.$scope.tournamentContext = {
      admin: false,
      owner: false,
    };
    this.$scope.tournamentInfo = {
      name: '',
      hidden: false,
    };
    this.$scope.toast = this.toast.bind(this);
    this.$scope.logout = () => {
      this.$cookies.remove('nfToken', { path: '/' });
      this.$window.location = '/';
    };

    this.setTabWatchers();
    this.getTournamentContext();

    this.sendingRequest = false;
  }

  resetOverview() {
    angular.copy(this.$scope.tournamentInfo, this.tournamentInfoCopy);
  }

  editTournament() {
    if (this.editTournamentForm.$valid) {
      const toastConfig = {
        message: 'Editing tournament',
      };
      this.$scope.toast(toastConfig);
      this.sendingRequest = true;
      this.TournamentService.edit(this.$scope.tournamentId, this.tournamentInfoCopy)
        .then((data) => {
          this.copyToOriginalTournamentObject(data);
          this.resetOverview();
          this.editing = false;
          toastConfig.message = 'Edited tournament.';
          toastConfig.success = true;
        })
        .catch(() => {
          toastConfig.message = 'Failed to update tournament.';
          toastConfig.success = false;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          this.sendingRequest = false;
          this.$scope.toast(toastConfig);
        });
    }
  }

  copyToOriginalTournamentObject(data) {
    angular.copy(data, this.$scope.tournamentInfo);
  }

  getTournamentContext() {
    this.TournamentService.getTournamentContext(this.$scope.tournamentId)
      .then(({ tournamentInfo, tournamentContext }) => {
        this.$scope.tournamentInfo = tournamentInfo;
        this.$scope.tournamentContext = tournamentContext;
        angular.copy(this.$scope.tournamentInfo, this.tournamentInfoCopy);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setTabWatchers() {
    this.$scope.$watch(angular.bind(this, () => {
      return this.tab;
    }), (newVal) => {
      localStorage.setItem(TOURNAMENT_TAB_KEY, newVal);
      history.replaceState(undefined, undefined, `#${newVal}`)
    });

    this.$scope.$watch(angular.bind(this, () => {
      return this.matchTab;
    }), (newVal) => {
      localStorage.setItem(MATCH_TAB_KEY, newVal);
    });

    this.$scope.$watch(angular.bind(this, () => {
      return this.teamTab;
    }), (newVal) => {
      localStorage.setItem(TEAM_TAB_KEY, newVal);
    });
  }

  toast({ message, success = null, hideAfter = false }) {
    if (hideAfter) {
      if (this.$scope.toastPromise) {
        this.$timeout.cancel(this.toastPromise);
      }
      this.toastPromise = this.$timeout(() => {
        this.$scope.toastMessage = null;
        this.toastPromise = null;
      }, 1500);
    }
    this.$scope.toastMessage = {
      message,
      success,
    };
  }

  slugify() {
    const name = this.$scope.tournamentInfo.name;
    return this.SlugService.slugify(name);
  }
}

TournamentController.$inject = ['$scope', '$window', '$timeout', '$cookies', 'TournamentService', 'TeamService', 'MatchService', 'SlugService'];
