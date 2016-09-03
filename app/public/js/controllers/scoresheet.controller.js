'use strict';

(function () {

    angular.module('tournamentApp').controller('ScoresheetCtrl', ['$scope', 'Tournament', 'Team', ScoresheetCtrl]);

    function ScoresheetCtrl($scope, Tournament, Team) {

        var vm = this;

        vm.teams = Team.teams;
        vm.pointScheme = Tournament.pointScheme;
        vm.rules = Tournament.rules;

        vm.game = {
            teams: [{
                teamInfo: null,
                players: []
            }, {
                teamInfo: null,
                players: []
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
                team.players.forEach(function (player) {
                    player.active = true;
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

        vm.getTeamBonusPointsForCycle = function (teamId, cycle) {
            return cycle.bonuses.filter(function (b) {
                return b === teamId;
            }).length * vm.pointScheme.bonusPointValue;
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
        };

        vm.getPlayerAnswerForCycle = function (player, cycle) {
            return cycle.answers.find(function (a) {
                return a.playerId === player.id;
            });
        };

        vm.addPlayerAnswerToCurrentCycle = function (player, team, answer) {
            if (vm.game.currentCycle.answers.findIndex(function (answer) {
                return answer.teamId === team.id;
            }) === -1) {
                vm.game.currentCycle.answers.push({
                    playerId: player.id,
                    teamId: team.id,
                    value: answer.value
                });
            }
        };

        vm.switchToBonusIfTossupGotten = function (answer) {
            if (answer.type !== 'Neg') {
                vm.switchCurrentCycleContext(true);
            }
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
    }
})();