(() => {
    
    angular.module('tournamentApp')
        .controller('StatisticsCtrl', ['$scope', 'Stats', StatisticsCtrl]);
    
    function StatisticsCtrl($scope, Stats) {
        
        let vm = this;
        
        vm.downloadQBJ = () => {
            Stats.getQBJReport($scope.tournamentId);
        }

    }
    
})();