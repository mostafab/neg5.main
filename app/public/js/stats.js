'use strict';

(function () {

    angular.module('statsApp', ['ngCookies', 'ngAnimate', 'tournamentApp']).config(function ($animateProvider) {
        $animateProvider.classNameFilter(/angular-animate/);
    });

    angular.module('statsApp').controller('PublicStatsController', ['$scope', '$window', '$timeout', 'Phase', 'Division', 'Stats', 'Cookies', PublicStatsController]);

    function PublicStatsController($scope, $window, $timeout, Phase, Division, Stats, Cookies) {

        var vm = this;

        var tournamentId = getTournamentIdFromUrl($window);

        vm.toastMessage = null;

        vm.phases = Phase.phases;
        vm.divisions = Division.divisions;
        vm.activeDivisions = [];

        vm.phase = null;

        vm.playerStats = Stats.playerStats;
        vm.teamStats = Stats.teamStats;

        vm.pointScheme = Stats.pointScheme;
        vm.tournamentName = Stats.tournamentName;

        vm.tab = Cookies.get('nfStatsTab') || 'team_standings';

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
                vm.filterDivisions();
                toastConfig.message = 'Loaded all stats.';
                toastConfig.success = true;
            }).catch(function (error) {
                toastConfig.message = 'Could not reload stats.';
                toastConfig.success = false;
            }).finally(function () {
                toastConfig.hideAfter = true;
                vm.toast(toastConfig);
            });
        };

        vm.filterDivisions = function () {
            vm.activeDivisions = vm.divisions.filter(function (division) {
                return vm.phase && division.phaseId === vm.phase.id;
            });
            console.log(vm.activeDivisions);
        };

        Phase.getPhases(tournamentId).then(function () {
            return Division.getDivisions(tournamentId);
        }).then(function () {
            return vm.refreshStats();
        });
    }

    function getTournamentIdFromUrl(windowObj) {
        return windowObj.location.pathname.split('/')[2];
    }
})();