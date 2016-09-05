'use strict';

(function () {

    angular.module('tournamentApp').controller('ScoresheetCtrl', ['$scope', 'Tournament', 'Team', 'Phase', 'Cookies', ScoresheetCtrl]);

    function ScoresheetCtrl($scope, Tournament, Team, Phase, Cookies) {

        var vm = this;

        vm.teams = Team.teams;
        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;
        vm.phases = Phase.phases;

        vm.game = {
            teams: [{
                teamInfo: null,
                players: [],
                newPlayer: '',
                overtime: 0
            }, {
                teamInfo: null,
                players: [],
                newPlayer: '',
                overtime: 0
            }],
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

        vm.loadTeamPlayers = function (team) {
            var _team$teamInfo = team.teamInfo;
            var id = _team$teamInfo.id;
            var name = _team$teamInfo.name;


            var toastConfig = { message: 'Loading ' + name + ' players.' };
            $scope.toast(toastConfig);
            Team.getTeamById($scope.tournamentId, id).then(function (_ref) {
                var players = _ref.players;

                team.players = players;
                team.players.forEach(function (player, index) {
                    player.active = index < vm.rules.maxActive;
                    player.tuh = 0;
                });

                toastConfig.message = 'Loaded ' + name + ' players.';
                toastConfig.success = true;
            }).catch(function (error) {
                toastConfig.message = 'Could not load ' + name + ' players.';
                toastConfig.success = false;
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
        };

        vm.submitScoresheet = function () {};

        vm.displayPlayerAnswerForCycle = function (event, player, cycle) {
            if (!cycle.editing) {
                cycle.editing = {};
            }
            cycle.editing[player.id] = !cycle.editing[player.id];
        };

        vm.addPlayer = function (team) {
            if (team.newPlayer.length > 0) {
                (function () {
                    var toastConfig = {
                        message: 'Adding ' + team.newPlayer + ' to ' + team.teamInfo.name
                    };
                    $scope.toast(toastConfig);
                    Team.addPlayer($scope.tournamentId, team.teamInfo.id, team.newPlayer).then(function (player) {
                        team.players.push({
                            name: player.name,
                            id: player.id,
                            tuh: 0,
                            active: team.players.length + 1 <= vm.rules.maxActive
                        });
                        team.newPlayer = '';

                        toastConfig.message = 'Added ' + player.name + ' to ' + team.teamInfo.name;
                        toastConfig.success = true;
                    }).catch(function (error) {
                        toastConfig.message = 'Could not add ' + team.newPlayer + ' to ' + team.teamInfo.name;
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.getTeamBouncebacks = function (teamId) {
            var sum = 0;
            vm.game.cycles.forEach(function (cycle) {
                if (!teamAnsweredTossupCorrectly(teamId, cycle) && cycleHasCorrectAnswer(cycle)) {
                    var numPartsBouncedBack = cycle.bonuses.filter(function (b) {
                        return b === teamId;
                    }).length;
                    sum += numPartsBouncedBack * vm.pointScheme.bonusPointValue;
                }
            });
            if (!teamAnsweredTossupCorrectly(teamId, vm.game.currentCycle) && cycleHasCorrectAnswer(vm.game.currentCycle)) {
                var numPartsBouncedBack = vm.game.currentCycle.bonuses.filter(function (b) {
                    return b === teamId;
                }).length;
                sum += numPartsBouncedBack * vm.pointScheme.bonusPointValue;
            }

            return sum;
        };

        vm.range = function (num) {
            return new Array(num);
        };

        vm.swapPlayers = function (players, initialIndex, toIndex) {
            // Swap works like this to get around angular dupes
            if (toIndex < 0) {
                toIndex = players.length - 1;
            } else if (toIndex === players.length) {
                toIndex = 0;
            }

            var tempArray = [];
            angular.copy(players, tempArray);

            var temp = players[initialIndex];
            tempArray[initialIndex] = tempArray[toIndex];
            tempArray[toIndex] = temp;

            angular.copy(tempArray, players);
        };

        vm.setTeamThatGotBonusPartCurrentCycle = function (index, team) {
            vm.game.currentCycle.bonuses[index] = vm.game.currentCycle.bonuses[index] === team.id ? null : team.id;
        };

        vm.getTeamThatGotTossup = function (cycle) {
            var index = cycle.answers.findIndex(function (a) {
                return a.type !== 'Neg';
            });
            return index === -1 ? null : cycle.answers[index].teamId;
        };

        vm.getTeamBonusPointsForCycle = function (teamId, cycleIndex) {
            var cycle = cycleIndex + 1 === vm.game.currentCycle.number ? vm.game.currentCycle : vm.game.cycles[cycleIndex];
            return cycle.bonuses.filter(function (b) {
                return b === teamId;
            }).length * vm.pointScheme.bonusPointValue;
        };

        vm.getTeamScoreUpToCycle = function (teamId, cycleIndex) {
            var score = 0;
            for (var i = 0; i <= cycleIndex; i++) {
                var cycle = vm.game.cycles[i];
                cycle.answers.forEach(function (a) {
                    if (a.teamId === teamId) {
                        score += a.value;
                    }
                });
                score += cycle.bonuses.filter(function (b) {
                    return b === teamId;
                }).length * vm.pointScheme.bonusPointValue;
            }
            if (cycleIndex + 1 === vm.game.currentCycle.number) {
                vm.game.currentCycle.answers.forEach(function (a) {
                    if (a.teamId === teamId) {
                        score += a.value;
                    }
                });
                score += vm.game.currentCycle.bonuses.filter(function (b) {
                    return b === teamId;
                }).length * vm.pointScheme.bonusPointValue;
            }

            return score;
        };

        vm.nextCycle = function () {
            var nextCycleNumber = vm.game.currentCycle.number + 1;
            var indexToAddCurrentCycleTo = vm.game.currentCycle.number - 1;
            if (indexToAddCurrentCycleTo >= vm.game.cycles.length - 1) {
                vm.game.cycles.push({
                    answers: [],
                    bonuses: []
                });
            }

            angular.copy(vm.game.currentCycle.answers, vm.game.cycles[indexToAddCurrentCycleTo].answers);
            angular.copy(vm.game.currentCycle.bonuses, vm.game.cycles[indexToAddCurrentCycleTo].bonuses);

            vm.game.currentCycle = {
                number: nextCycleNumber,
                answers: [],
                bonuses: []
            };

            incrementActivePlayersTUH(1);

            saveScoresheet();
        };

        vm.lastCycle = function () {
            if (vm.game.currentCycle.number > 1) {
                var indexToReset = vm.game.currentCycle.number - 1;
                vm.game.cycles[indexToReset] = {
                    answers: [],
                    bonuses: []
                };
                vm.game.cycles[indexToReset - 1].bonuses = [];
                vm.game.cycles[indexToReset - 1].answers = [];

                vm.game.currentCycle = {
                    answers: [],
                    bonuses: [],
                    number: vm.game.currentCycle.number - 1
                };
            }

            incrementActivePlayersTUH(-1);

            saveScoresheet();
        };

        vm.getPlayerAnswerForCycle = function (player, cycle) {
            return cycle.answers.find(function (a) {
                return a.playerId === player.id;
            });
        };

        vm.addPlayerAnswerToCurrentCycle = function (player, team, answer) {
            if (teamDidNotAnswerInCycle(team, vm.game.currentCycle)) {
                vm.game.currentCycle.answers.push({
                    playerId: player.id,
                    teamId: team.id,
                    value: answer.value,
                    type: answer.type
                });
            }
        };

        vm.getNumberOfTossupTypeForPlayer = function (player, tossupValue) {
            var cycleTotal = vm.game.cycles.reduce(function (total, cycle) {

                var numberInCycle = cycle.answers.filter(function (a) {
                    return a.playerId === player.id && a.value === tossupValue.value;
                }).length;

                return total + numberInCycle;
            }, 0);

            var numberInCurrentCycle = vm.game.currentCycle.answers.filter(function (a) {
                return a.playerId === player.id && a.type === tossupValue.type;
            }).length;

            return cycleTotal + numberInCurrentCycle;
        };

        vm.getPlayerTotalPoints = function (player) {
            var total = 0;
            vm.pointScheme.tossupValues.forEach(function (tv) {
                var numberForCurrentTV = vm.getNumberOfTossupTypeForPlayer(player, tv);

                total += numberForCurrentTV * tv.value;
            });
            return total;
        };

        vm.switchToBonusIfTossupGotten = function (answer, teamId) {
            if (answer.type !== 'Neg' && vm.teamDidNotNegInCycle(teamId, vm.game.currentCycle)) {
                vm.switchCurrentCycleContext(true);
            }
        };

        vm.removeLastAnswerFromCycle = function (cycle) {
            cycle.answers.pop();
            cycle.bonuses = [];
        };

        vm.getTeam = function (teamId) {
            if (teamId) {
                return vm.game.teams.find(function (team) {
                    return team.teamInfo.id === teamId;
                });
            }
        };

        vm.switchCurrentCycleContext = function (toBonus) {
            vm.game.onTossup = !toBonus;
        };

        vm.teamDidNotNegInCycle = function (teamId, cycle) {
            return cycle.answers.findIndex(function (answer) {
                return answer.type === 'Neg' && answer.teamId === teamId;
            }) === -1;
        };

        vm.removeTeamNegsFromCycle = function (teamId, cycle) {
            cycle.answers = cycle.answers.filter(function (a) {
                return !(a.type === 'Neg' && a.teamId === teamId);
            });
        };

        vm.loadLastSavedScoresheet = function () {
            var lastScoresheet = Cookies.localStorage.get('scoresheet');
            if (!lastScoresheet) {
                $scope.toast({
                    message: 'No prior saved scoresheet',
                    success: false,
                    hideAfter: true
                });
            } else {
                vm.game = JSON.parse(lastScoresheet);
                $scope.toast({
                    message: 'Loaded scoresheet',
                    success: true,
                    hideAfter: true
                });
            }
        };

        function teamDidNotAnswerInCycle(team, cycle) {
            return cycle.answers.findIndex(function (answer) {
                return answer.teamId === team.id;
            }) === -1;
        }

        function cycleHasCorrectAnswer(cycle) {
            return cycle.answers.some(function (a) {
                return a.type !== 'Neg';
            });
        }

        function teamAnsweredTossupCorrectly(teamId, cycle) {
            return cycle.answers.some(function (a) {
                return a.teamId === teamId && a.type !== 'Neg';
            });
        }

        function incrementActivePlayersTUH(num) {
            vm.game.teams.forEach(function (team) {
                team.players.forEach(function (player) {
                    if (player.active && player.tuh + num >= 0) {
                        player.tuh += num;
                    }
                });
            });
        }

        function initializeCyclesArray() {
            var arr = [];
            for (var i = 0; i < 20; i++) {
                arr.push({
                    answers: [],
                    bonuses: []
                });
            }
            return arr;
        }

        function saveScoresheet() {
            Cookies.localStorage.set('scoresheet', JSON.stringify(vm.game));
        }
    }
})();