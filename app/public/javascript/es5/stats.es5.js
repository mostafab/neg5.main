'use strict';

/* global angular */
(function () {
  angular.module('statsApp', ['ngCookies', 'ngAnimate', 'tournamentApp']).config(function ($animateProvider) {
    $animateProvider.classNameFilter(/angular-animate/);
  });

  angular.module('statsApp').controller('PublicStatsController', ['$scope', '$window', '$timeout', 'Phase', 'Stats', 'Cookies', PublicStatsController]);

  function PublicStatsController($scope, $window, $timeout, Phase, Stats, Cookies) {

    var vm = this;

    var tournamentId = getTournamentIdFromUrl($window);

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

    vm.tab = function () {
      var setTab = Cookies.get('nfStatsTab') || 'team_standings';
      return setTab;
    }();

    vm.activePhase = Stats.activePhase;

    vm.toast = function (_ref) {
      var message = _ref.message;
      var _ref$success = _ref.success;
      var success = _ref$success === undefined ? null : _ref$success;
      var _ref$hideAfter = _ref.hideAfter;
      var hideAfter = _ref$hideAfter === undefined ? false : _ref$hideAfter;

      if (hideAfter) {
        $timeout(function () {
          vm.toastMessage = null;
        }, 2500);
      }
      vm.toastMessage = {
        message: message,
        success: success
      };
    };

    $scope.$watch(angular.bind(vm, function () {
      return vm.tab;
    }), function (newVal) {
      Cookies.set('nfStatsTab', newVal);
    });

    vm.refreshStats = function () {
      var toastConfig = { message: 'Refreshing stats.' };
      vm.toast(toastConfig);
      Stats.refreshStats(tournamentId, vm.phase ? vm.phase.id : null).then(function () {
        toastConfig.message = 'Loaded stats for ' + (vm.phase ? vm.phase.name + '.' : 'all games.');
        toastConfig.success = true;
      }).catch(function () {
        toastConfig.message = 'Could not reload stats.';
        toastConfig.success = false;
      }).finally(function () {
        toastConfig.hideAfter = true;
        vm.toast(toastConfig);
      });
    };

    vm.setHashLocation = function (newHash) {
      $timeout(function () {
        $window.location.hash = "#" + newHash;
      }, 50);
    };

    Phase.getPhases(tournamentId).then(function () {
      return vm.refreshStats();
    });
  }

  function getTournamentIdFromUrl(windowObj) {
    return windowObj.location.pathname.split('/')[2];
  }
})();