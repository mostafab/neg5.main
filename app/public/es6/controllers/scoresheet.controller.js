(() => {

    angular.module('tournamentApp')
        .controller('ScoresheetCtrl', ['$scope', 'Tournament', 'Team', 'Phase', 'Cookies', ScoresheetCtrl]);
        
    function ScoresheetCtrl($scope, Tournament, Team, Phase, Cookies) {
        
        let vm = this;
        
        vm.teams = Team.teams;
        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;
        vm.phases = Phase.phases;

        vm.game = {
            teams: [
                {
                    teamInfo: null,
                    players: [],
                    newPlayer: '',
                    overtime: 0
                },
                {
                    teamInfo: null,
                    players: [],
                    newPlayer: '',
                    overtime: 0
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
            phases: [],
            room: null
        };

        vm.loadTeamPlayers = (team) => {
            let {id, name} = team.teamInfo;

            let toastConfig = {message: 'Loading ' + name + ' players.'};
            $scope.toast(toastConfig);
            Team.getTeamById($scope.tournamentId, id)
                .then(({players}) => {
                    team.players = players;
                    team.players.forEach((player, index) => {
                        player.active = index < vm.rules.maxActive;
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
        
        vm.addPlayer = (team) => {
            if (team.newPlayer.length > 0) {
                let toastConfig = {
                    message: 'Adding ' + team.newPlayer + ' to ' + team.teamInfo.name
                }
                $scope.toast(toastConfig);
                Team.addPlayer($scope.tournamentId, team.teamInfo.id, team.newPlayer)
                    .then((player) => {
                        team.players.push({
                            name: player.name,
                            id: player.id,
                            tuh: 0,
                            active: team.players.length + 1 <= vm.rules.maxActive
                        })
                        team.newPlayer = '';
                        
                        toastConfig.message = 'Added ' + player.name + ' to ' + team.teamInfo.name;
                        toastConfig.success = true;
                    })
                    .catch(error => {
                        toastConfig.message = 'Could not add ' + team.newPlayer + ' to ' + team.teamInfo.name;
                        toastConfig.success = false; 
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })
            }
            
        }
        
        vm.getTeamBouncebacks = (teamId) => {
            let sum = 0;
            vm.game.cycles.forEach(cycle => {
                if (!teamAnsweredTossupCorrectly(teamId, cycle) && cycleHasCorrectAnswer(cycle)) {
                    let numPartsBouncedBack = cycle.bonuses.filter(b => b === teamId).length;
                    sum += numPartsBouncedBack * vm.pointScheme.bonusPointValue;
                }
            })
            if (!teamAnsweredTossupCorrectly(teamId, vm.game.currentCycle) && cycleHasCorrectAnswer(vm.game.currentCycle)) {
                let numPartsBouncedBack = vm.game.currentCycle.bonuses.filter(b => b === teamId).length;
                sum += numPartsBouncedBack * vm.pointScheme.bonusPointValue;
            }
            
            return sum;
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

        vm.getTeamBonusPointsForCycle = (teamId, cycleIndex) => {
            let cycle = cycleIndex + 1 === vm.game.currentCycle.number ? vm.game.currentCycle : vm.game.cycles[cycleIndex];
            return cycle.bonuses.filter(b => b === teamId).length * vm.pointScheme.bonusPointValue;   
        }
        
        vm.getTeamScoreUpToCycle = (teamId, cycleIndex) => {
            let score = 0;
            for (let i = 0; i <= cycleIndex; i++) {
                let cycle = vm.game.cycles[i];
                cycle.answers.forEach(a => {
                    if (a.teamId === teamId) {
                        score += a.value;
                    }
                })
                score += cycle.bonuses.filter(b => b === teamId).length * vm.pointScheme.bonusPointValue;
            }
            if (cycleIndex + 1 === vm.game.currentCycle.number) {
                vm.game.currentCycle.answers.forEach(a => {
                    if (a.teamId === teamId) {
                        score += a.value;
                    }
                })
                score += vm.game.currentCycle.bonuses.filter(b => b === teamId).length * vm.pointScheme.bonusPointValue;
            }
            
            return score;
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
            
            saveScoresheet();

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
            
            saveScoresheet();
            
        }

        vm.getPlayerAnswerForCycle = (player, cycle) => {
            return cycle.answers.find(a => a.playerId === player.id);
        }

        vm.addPlayerAnswerToCurrentCycle = (player, team, answer) => {
            if (teamDidNotAnswerInCycle(team, vm.game.currentCycle)) {
                vm.game.currentCycle.answers.push({
                    playerId: player.id,
                    teamId: team.id,
                    value: answer.value,
                    type: answer.type
                })
            }            
        }
        
        vm.getNumberOfTossupTypeForPlayer = (player, tossupValue) => {
            let cycleTotal = vm.game.cycles.reduce((total, cycle) => {
                
                let numberInCycle = cycle.answers.filter(a => a.playerId === player.id && a.value === tossupValue.value).length;
                
                return total + numberInCycle;
                
            }, 0);
            
            let numberInCurrentCycle = vm.game.currentCycle.answers.filter(a => a.playerId === player.id && a.type === tossupValue.type).length; 
            
            return cycleTotal + numberInCurrentCycle;
        }
        
        vm.getPlayerTotalPoints = (player) => {
            let total = 0;
            vm.pointScheme.tossupValues.forEach(tv => {
                let numberForCurrentTV = vm.getNumberOfTossupTypeForPlayer(player, tv);
                
                total += (numberForCurrentTV * tv.value);
            })            
            return total;

        }

        vm.switchToBonusIfTossupGotten = (answer, teamId) => {
            if (answer.type !== 'Neg' && vm.teamDidNotNegInCycle(teamId, vm.game.currentCycle)) {
                vm.switchCurrentCycleContext(true);
            }
        }
        
        vm.removeLastAnswerFromCycle = (cycle) => {
            cycle.answers.pop();
            cycle.bonuses = [];
        }

        vm.getTeam = (teamId) => {
            if (teamId) {
                return vm.game.teams.find(team => team.teamInfo.id === teamId)
            }
        }

        vm.switchCurrentCycleContext = (toBonus) => {
            vm.game.onTossup = !toBonus;
        }
        
        vm.teamDidNotNegInCycle = (teamId, cycle) => {
            return cycle.answers.findIndex(answer => answer.type === 'Neg' && answer.teamId === teamId) === -1;
        }
        
        vm.removeTeamNegsFromCycle = (teamId, cycle) => {
            cycle.answers = cycle.answers.filter(a => !(a.type === 'Neg' && a.teamId === teamId));
        }
        
        vm.loadLastSavedScoresheet = () => {
            let lastScoresheet = Cookies.localStorage.get('scoresheet');
            if (!lastScoresheet) {
                $scope.toast({
                    message: 'No prior saved scoresheet',
                    success: false,
                    hideAfter: true
                })
            } else {
                vm.game = JSON.parse(lastScoresheet);
                $scope.toast({
                    message: 'Loaded scoresheet',
                    success: true,
                    hideAfter: true
                })      
            }
        }
        
        function teamDidNotAnswerInCycle(team, cycle) {
            return cycle.answers.findIndex(answer => answer.teamId === team.id) === -1;
        }
        
        function cycleHasCorrectAnswer(cycle) {
            return cycle.answers.some(a => a.type !== 'Neg');
        }
        
        function teamAnsweredTossupCorrectly(teamId, cycle) {
            return cycle.answers.some(a => a.teamId === teamId && a.type !== 'Neg');
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
        
        function saveScoresheet() {
            Cookies.localStorage.set('scoresheet', JSON.stringify(vm.game));
        }
        
    }
    
})();