(() => {
    
    angular.module('tournamentApp')
        .controller('ScoresheetCtrl', ['$scope', 'Team', ScoresheetCtrl]);
        
    function ScoresheetCtrl($scope, Team) {
        
        let vm = this;
        
        vm.teams = Team.teams;
        
    }
    
})();