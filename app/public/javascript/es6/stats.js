/* global angular */
(() => {
  angular.module('statsApp', ['ngCookies', 'ngAnimate', 'tournamentApp'])
    .config(($animateProvider) => {
      $animateProvider.classNameFilter(/angular-animate/);
    });

  angular.module('statsApp').controller('PublicStatsController', ['$scope', '$window', '$timeout', 'Phase', 'Stats', 'Cookies', PublicStatsController]);

  function PublicStatsController($scope, $window, $timeout, Phase, Stats, Cookies) {

    const vm = this;

    const tournamentId = getTournamentIdFromUrl($window)

    vm.toastMessage = null;

    vm.phases = Phase.phases;
    vm.divisions = Stats.divisions;

    vm.unassignedTeams = Stats.unassignedTeams;

    vm.phase = null;

    vm.playerStats = Stats.playerStats;
    vm.teamStats = Stats.teamStats;
    vm.teamFullStats = Stats.teamFullStats;
    vm.playerFullStats = Stats.playerFullStats;
    vm.roundReportStats = Stats.roundReportStats;

    vm.pointScheme = Stats.pointScheme;
    vm.tournamentName = Stats.tournamentName;

    vm.tab = (() => {
      const setTab = Cookies.get('nfStatsTab') || 'team_standings';
      return setTab;
    })();

    vm.activePhase = Stats.activePhase;

    vm.toast = ({ message, success = null, hideAfter = false }) => {
      if (hideAfter) {
        $timeout(() => {
          vm.toastMessage = null;
        }, 2500);
      }
      vm.toastMessage = {
        message,
        success,
      };
    };

    $scope.$watch(angular.bind(vm, () => {
      return vm.tab;
    }), (newVal) => {
      Cookies.set('nfStatsTab', newVal);
    });

    vm.refreshStats = () => {
      const toastConfig = { message: 'Refreshing stats.' };
      vm.toast(toastConfig);
      Stats.refreshStats(tournamentId, vm.phase ? vm.phase.id : null)
        .then(() => {
          toastConfig.message = 'Loaded stats for ' + (vm.phase ? vm.phase.name + '.' : 'all games.');
          toastConfig.success = true;
        })
        .catch(() => {
          toastConfig.message = 'Could not reload stats.';
          toastConfig.success = false;
        })
        .finally(() => {
          toastConfig.hideAfter = true;
          vm.toast(toastConfig);
        });
    };

    vm.setHashLocation = (newHash) => {
      $timeout(() => {
        $window.location.hash = "#" + newHash;
      }, 50);
    };

    Phase.getPhases(tournamentId)
        .then(() => vm.refreshStats());        
  }

  function getTournamentIdFromUrl(windowObj) {
    return windowObj.location.pathname.split('/')[2];
  }
})();






