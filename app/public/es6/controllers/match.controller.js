(() => {
    
    angular.module('tournamentApp')
        .filter('preventSameMatchTeams', () => {
            return (items, otherTeamId) => {
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
        vm.rules = Tournament.rules;
        
        vm.pointSum = function(points) {
            if (!points) {return 0;}
            let values = Object.keys(points);
            return values.reduce((sum, current) => {
                let product = (points[current + ''] * current) || 0;
                return sum + product;
            }, 0)
        }

        vm.teamBonusPoints = (team) => {
            let tossupSum = team.players.map(player => vm.pointSum(player.points)).reduce((sum, current) => sum + current, 0);
            return (team.score || 0) - tossupSum - (team.bouncebacks || 0);
        }

        vm.teamPPB = (team) => {
            if (team.players.length === 0) return 0;

            let totalTossupsWithoutOT = totalTeamTossupGets(team) - (team.overtime || 0);
            let totalBonusPoints = vm.teamBonusPoints(team);
            return (totalBonusPoints / totalTossupsWithoutOT) || 0;
        } 

        function totalTeamTossupGets(team) {
             let totalTossups = team.players.map(player => {
                let sum = 0;
                for (let pv in player.points) {
                    if (player.points.hasOwnProperty(pv) && pv > 0) {
                        sum += player.points[pv];
                    }
                }
                return sum;
            })
            .reduce((sum, current) => sum + current, 0);
            return totalTossups;
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
            phases: [],
            round: 1,
            tuh: 20,
            room: null,
            moderator: null,
            packet: null,
            notes: null
        }
        
        vm.addTeam = (team) => {
            let toastConfig = {message: 'Loading ' + team.teamInfo.name + ' players.'};
            $scope.toast(toastConfig);
            Game.getTeamPlayers($scope.tournamentId, team.teamInfo.id)
                .then(players => {
                    team.players = players.map(({name, id}) => {
                        return {
                            id,
                            name,
                            points: vm.pointScheme.tossupValues.reduce((obj, current) => {
                                obj[current.value] = 0;
                                return obj;
                            }, {}),
                            tuh: vm.currentGame.tuh
                        }
                    });
                    toastConfig.success = true;
                    toastConfig.message = 'Loaded ' + team.teamInfo.name + ' players (' + team.players.length + ')';
                })
                .catch(error => {
                    toastConfig.success = false;
                    toastConfig.message = 'Could not load team.';
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                })
        }
        
        vm.getGames = () => Game.getGames($scope.tournamentId);
        
        vm.addGame = () => {
            if (vm.newGameForm.$valid) {
                let toastConfig = {message: 'Adding match.'};
                $scope.toast(toastConfig);
                Game.postGame($scope.tournamentId, vm.currentGame)
                    .then(() => {
                        vm.resetCurrentGame();
                        vm.getGames();
                        toastConfig.success = true;
                        toastConfig.message = 'Added match';
                    })
                    .catch(error => {
                        toastConfig.success = false;
                        toastConfig.message = 'Could not add match';
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })
            }
        };

        vm.resetCurrentGame = () => {
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
                phases: [],
                round: 1,
                tuh: 20,
                room: null,
                moderator: null,
                packet: null,
                notes: null
            }
        }
        
        vm.getGames();
        
    }
    
})();