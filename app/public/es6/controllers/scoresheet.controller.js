(() => {

    angular.module('tournamentApp')
        .controller('ScoresheetCtrl', ['$scope', 'Tournament', 'Team', ScoresheetCtrl]);
        
    function ScoresheetCtrl($scope, Tournament, Team) {
        
        let vm = this;
        
        vm.teams = Team.teams;
        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;

        vm.game = {
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
            cycles: initializeCyclesArray(),
            currentCycle: {
                number: 1,
                answers: [],
                bonuses: [] 
            },
            onTossup: true,
            round: 0,
            packet: null,
            notes: null,
            room: null
        };

        vm.loadTeamPlayers = (team) => {
            let {id, name} = team.teamInfo;

            let toastConfig = {message: 'Loading ' + name + ' players.'};
            $scope.toast(toastConfig);
            Team.getTeamById($scope.tournamentId, id)
                .then(({players}) => {
                    team.players = players;
                    team.players.forEach(player => {
                        player.active = true
                        player.tuh = 0;
                    });

                    toastConfig.message = 'Loaded ' + name + ' players.';
                    toastConfig.success = true;
                })
                .catch(error => {
                    toastConfig.message = 'Could not load ' + name + ' players.';
                    toastConfig.success = false;
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                })
        }

        vm.range = (num) => {
            return new Array(num);
        }

        vm.swapPlayers = (players, initialIndex, toIndex) => { // Swap works like this to get around angular dupes
            if (toIndex < 0) {
                toIndex = players.length - 1;
            } else if (toIndex === players.length) {
                toIndex = 0;
            }

            let tempArray = [];
            angular.copy(players, tempArray);

            let temp = players[initialIndex];
            tempArray[initialIndex] = tempArray[toIndex];
            tempArray[toIndex] = temp;

            angular.copy(tempArray, players);

        }

        vm.setTeamThatGotBonusPartCurrentCycle = (index, team) => {
            vm.game.currentCycle.bonuses[index] = vm.game.currentCycle.bonuses[index] === team.id ? null : team.id;
        }

        vm.getTeamThatGotTossup = (cycle) => {
            let index = cycle.answers.findIndex(a => a.type !== 'Neg');
            return index === -1 ? null : cycle.answers[index].teamId
        }

        vm.getTeamBonusPointsForCycle = (teamId, cycle) => {
            return cycle.bonuses.filter(b => b === teamId).length * vm.pointScheme.bonusPointValue;
        }

        vm.nextCycle = () => {
            let nextCycleNumber = vm.game.currentCycle.number + 1;
            let indexToAddCurrentCycleTo = vm.game.currentCycle.number - 1;
            if (indexToAddCurrentCycleTo >= vm.game.cycles.length - 1) {
                vm.game.cycles.push({
                    answers: [],
                    bonuses: []
                })
            }

            angular.copy(vm.game.currentCycle.answers, vm.game.cycles[indexToAddCurrentCycleTo].answers)
            angular.copy(vm.game.currentCycle.bonuses, vm.game.cycles[indexToAddCurrentCycleTo].bonuses)

            vm.game.currentCycle = {
                number: nextCycleNumber,
                answers: [],
                bonuses: []
            }

            incrementActivePlayersTUH(1);

        }

        vm.lastCycle = () => {
            if (vm.game.currentCycle.number > 1) {
                let indexToReset = vm.game.currentCycle.number - 1;
                vm.game.cycles[indexToReset] = {
                    answers: [],
                    bonuses: []
                }
                vm.game.cycles[indexToReset - 1].bonuses = [];
                vm.game.cycles[indexToReset -1].answers = [];

                vm.game.currentCycle = {
                    answers: [],
                    bonuses: [],
                    number: vm.game.currentCycle.number - 1
                }
            }

            incrementActivePlayersTUH(-1);
            
        }

        vm.getPlayerAnswerForCycle = (player, cycle) => {
            return cycle.answers.find(a => a.playerId === player.id);
        }

        vm.addPlayerAnswerToCurrentCycle = (player, team, answer) => {
            if (vm.game.currentCycle.answers.findIndex(answer => answer.teamId === team.id) === -1) {
                vm.game.currentCycle.answers.push({
                    playerId: player.id,
                    teamId: team.id,
                    value: answer.value
                })
            }            
        }

        vm.switchToBonusIfTossupGotten = (answer) => {
            if (answer.type !== 'Neg') {
                vm.switchCurrentCycleContext(true);
            }
        }

        vm.getTeam = (teamId) => {
            if (teamId) {
                return vm.game.teams.find(team => team.teamInfo.id === teamId)
            }
        }

        vm.switchCurrentCycleContext = (toBonus) => {
            vm.game.onTossup = !toBonus;
        }

        function incrementActivePlayersTUH(num) {
            vm.game.teams.forEach(team => {
                team.players.forEach(player => {
                    if (player.active && player.tuh + num >= 0) {
                        player.tuh += num;
                    }
                })
            })
        }

        function initializeCyclesArray() {
            let arr = [];
            for (let i = 0; i < 20; i++) {
                arr.push({
                    answers: [],
                    bonuses: []
                })
            }
            return arr;
        }
        
    }
    
})();