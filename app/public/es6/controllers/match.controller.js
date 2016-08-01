(() => {
    
    angular.module('tournamentApp')
        .filter('preventSameMatchTeams', () => {
            return function(items, otherTeamId) {
                return items.filter(item => item.id !== otherTeamId)
            }
        });

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
            let values = Object.keys(points);
            return values.reduce((sum, current) => {
                let product = (points[current + ''] * current) || 0;
                return sum + product;
            }, 0)
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
        
        vm.addTeam = (team) => {
            Game.getTeamPlayers($scope.tournamentId, team.teamInfo.id)
                .then(players => {
                    team.players = players.map(({name, id}) => {
                        return {
                            id,
                            name,
                            points: vm.pointScheme.tossupValues.reduce((obj, current) => {
                                obj[current.value] = 0;
                                return obj;
                            }, {})
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

        vm.displayTeamInOptions = (id, otherSelectedTeam) => {
            console.log(id);
        }
        
        vm.getGames();
        
    }
    
})();