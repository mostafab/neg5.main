(() => {
    
    angular.module('tournamentApp')
        .controller('GameCtrl', ['$scope', 'Team', 'Game', 'Phase', 'Tournament', GameCtrl]);
    
    function GameCtrl($scope, Team, Game, Phase, Tournament) {
        
        let vm = this;

        vm.teams = Team.teams;
        vm.games = Game.games;
        vm.phases = Phase.phases;
        
        vm.sortType = 'round';
        vm.sortReverse = false;
        vm.gameQuery = '';

        vm.pointScheme = Tournament.pointScheme;
        
        vm.pointSum = function(points) {
            return points.map(({number, value}) => (number * value) || 0)
                .reduce((sum, product) => sum + product, 0);
        }
        
        vm.currentGame = {
            teams: [
               {
                  teamInfo: null,
                  players: []
               },
               {
                  teamInfo: null,
                  players: []
               } 
            ],
            phases: [
                
            ],
            round: 1,
            tuh: 20,
            room: '',
            moderator: '',
            packet: '',
            notes: ''
        }
        
        vm.addTeam = (index) => {
            Game.getTeamPlayers($scope.tournamentId, vm.currentGame.teams[index].teamInfo.id)
                .then(players => {
                    vm.currentGame.teams[index].players = players.map(({name, id}) => {
                        return {
                            id,
                            name,
                            points: vm.pointScheme.slice().map(({value}) => {
                                return {
                                    value,
                                    number: 0
                                }
                            })
                        }
                    });
                })
                .catch(error => {
                    console.log(error);
                })
        }
        
        vm.test = () => console.log(vm.currentGame.phases);
        
        vm.getGames = () => Game.getGames($scope.tournamentId);
        
        vm.addGame = () => console.log(vm.currentGame);
        
        vm.removeGame = (id) => console.log(id);
        
        vm.getGames();
        
    }
    
})();