(() => {
    
    angular.module('tournamentApp')
        .controller('GameCtrl', ['$scope', 'Team', 'Game', 'Phase', GameCtrl]);
    
    function GameCtrl($scope, Team, Game, Phase) {
        
        let vm = this;
        
        vm.teams = Team.teams;
        vm.games = Game.games;
        vm.phases = Phase.phases;
        
        vm.sortType = 'round';
        vm.sortReverse = false;
        vm.gameQuery = '';
        
        vm.currentGame = {
            team1: {
                score: 0,
                bouncebacks: 0,
                overtime: 0
            },
            team2: {
                score: 0,
                bouncebacks: 0,
                overtime: 0
            },
            phases: [
                
            ],
            round: 1,
            tuh: 20,
            room: '',
            moderator: '',
            packet: '',
            notes: ''
        }
        
        vm.test = () => console.log(vm.currentGame.phases);
        
        vm.getGames = () => Game.getGames($scope.tournamentId);
        
        vm.addGame = () => console.log(vm.currentGame);
        
        vm.removeGame = (id) => console.log(id);
        
        vm.getGames();
        
    }
    
})();