(() => {
    
    angular.module('tournamentApp')
        .controller('StatisticsCtrl', ['$scope', 'Team', StatisticsCtrl]);
    
    function StatisticsCtrl($scope, Team) {
        
        let vm = this;
        
        vm.teams = Team.teams;
        

    }
    
})();