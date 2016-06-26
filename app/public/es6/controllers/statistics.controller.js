(() => {
    
    angular.module('tournamentApp')
        .controller('StatisticsCtrl', ['$scope', 'Team', 'Phase', StatisticsCtrl]);
    
    function StatisticsCtrl($scope, Team, Phase) {
        
        let vm = this;
        
        vm.teams = Team.teams;
        vm.phases = Phase.phases;
        

    }
    
})();