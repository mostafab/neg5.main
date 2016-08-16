(() => {
    
  angular.module('statsApp', ['ngCookies', 'ngAnimate', 'tournamentApp'])
    .config($animateProvider => {
      $animateProvider.classNameFilter(/angular-animate/);
    })

    angular.module('statsApp').controller('PublicStatsController', ['$scope', '$window', '$timeout', 'Phase', 'Stats', 'Cookies', PublicStatsController]);

    function PublicStatsController($scope, $window, $timeout, Phase, Stats, Cookies) {

        let vm = this;

        let tournamentId = getTournamentIdFromUrl($window)

        vm.toastMessage = null;

        vm.phases = Phase.phases;
        vm.divisions = Stats.divisions;

        vm.unassignedTeams = Stats.unassignedTeams;

        vm.phase = null;

        vm.playerStats = Stats.playerStats;
        vm.teamStats = Stats.teamStats;

        vm.pointScheme = Stats.pointScheme;
        vm.tournamentName = Stats.tournamentName;

        vm.tab = Cookies.get('nfStatsTab') || 'team_standings';

        vm.activePhase = Stats.activePhase;

        vm.toast = ({message, success = null, hideAfter = false}) => {
                if (hideAfter) {
                    $timeout(() => {
                        vm.toastMessage = null;
                    }, 2500);
                }
                vm.toastMessage = {
                    message,
                    success
                }                
            }

        $scope.$watch(angular.bind(vm, () => {
                    return vm.tab;
                }), (newVal) => {
                    Cookies.set('nfStatsTab', newVal);
                });

        vm.refreshStats = () => {
            let toastConfig = {message: 'Refreshing stats.'};
            vm.toast(toastConfig);
            Stats.refreshStats(tournamentId, vm.phase ? vm.phase.id : null)
                .then(() => {
                    toastConfig.message = 'Loaded all stats.';
                    toastConfig.success = true;
                })
                .catch(error => {
                    toastConfig.message = 'Could not reload stats.';
                    toastConfig.success = false;
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    vm.toast(toastConfig);
                })
        }

        Phase.getPhases(tournamentId)
            .then(() => vm.refreshStats());        

    }

    function getTournamentIdFromUrl(windowObj) {
        return windowObj.location.pathname.split('/')[2];
    }

})();






