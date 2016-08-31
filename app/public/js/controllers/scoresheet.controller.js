'use strict';

(function () {

    angular.module('tournamentApp').controller('ScoresheetCtrl', ['$scope', 'Tournament', 'Team', ScoresheetCtrl]);

    function ScoresheetCtrl($scope, Tournament, Team) {

        var vm = this;

        vm.teams = Team.teams;
        vm.pointScheme = Tournament.pointScheme;

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
                answers: []
            },
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

        vm.nextCycle = function () {
            var nextCycleNumber = vm.game.currentCycle.number + 1;
            var indexToAddCurrentCycleTo = vm.game.currentCycle.number - 1;
            if (indexToAddCurrentCycleTo >= vm.game.cycles.length - 1) {
                vm.game.cycles.push({
                    answers: []
                });
            }

            angular.copy(vm.game.currentCycle.answers, vm.game.cycles[indexToAddCurrentCycleTo].answers);

            vm.game.currentCycle = {
                number: nextCycleNumber,
                answers: []
            };
        };

        vm.lastCycle = function () {
            if (vm.game.currentCycle.number > 1) {
                var indexToReset = vm.game.currentCycle.number - 1;
                vm.game.cycles[indexToReset].answers = [];
                vm.game.currentCycle = {
                    answers: [],
                    number: vm.game.currentCycle.number - 1
                };
            }
        };

        vm.getPlayerAnswerForCycle = function (player, cycle) {
            // let currentCycleNumber = vm.game.currentCycle.number;
            // if (cycle.number === currentCycleNumber) {
            //     return vm.game.currentCycle.answers.find(a => a.playerId === player.id);
            // } else {
            //     return cycle.answers.find(a => a.playerId === player.id);
            // }

            return cycle.answers.find(function (a) {
                return a.playerId === player.id;
            });
        };

        vm.addPlayerAnswerToCurrentCycle = function (player, team, answer) {
            vm.game.currentCycle.answers.push({
                playerId: player.id,
                teamId: team.id,
                value: answer.value
            });
        };

        function initializeCyclesArray() {
            var arr = [];
            for (var i = 0; i < 20; i++) {
                arr.push({
                    answers: []
                });
            }
            return arr;
        }
    }
})();