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

export default class TournamentController {
  constructor($scope, $window, $timeout, $cookies, TournamentService, TeamService, MatchService) {
    this.$scope = $scope;
    this.$window = $window;
    this.$timeout = $timeout;
    this.$cookies = $cookies;
    this.TournamentService = TournamentService;
    this.TeamService = TeamService;
    this.MatchService = MatchService;

    this.$scope.toastMessage = null;
    this.toastPromise = null;

    if (location.hash) {
      const tab = location.hash.substr(1);
      if (validTabs.indexOf(tab) !== -1) {
        this.tab = location.hash.substr(1);
      } else {
        this.tab = this.$cookies.get('nfTab') || 'overview';
      }
    } else {
      this.tab = this.$cookies.get('nfTab') || 'overview';
    }
    this.matchTab = 'add';
    this.teamTab = 'add';

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
      this.$cookies.put('nfTab', newVal);
      location.hash = `#${newVal}`;
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
      }, 3000);
    }
    this.$scope.toastMessage = {
      message,
      success,
    };
  }
}

TournamentController.$inject = ['$scope', '$window', '$timeout', '$cookies', 'TournamentService', 'TeamService', 'MatchService'];
