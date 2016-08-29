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

        vm.getPlayerAnswerForCycle = function (player, cycle) {
            var currentCycleNumber = vm.game.currentCycle.number;
            if (cycle.number === currentCycleNumber) {
                return vm.game.currentCycle.answers.find(function (a) {
                    return a.playerId === player.id;
                });
            } else {
                return cycle.answers.find(function (a) {
                    return a.playerId === player.id;
                });
            }
        };

        vm.addPlayerAnswerToCurrentCycle = function (player, answer) {
            vm.game.currentCycle.answers.push({
                playerId: player.id,
                value: answer.value
            });
        };

        function initializeCyclesArray() {
            var arr = [];
            for (var i = 0; i < 20; i++) {
                arr.push({
                    answers: [],
                    number: i + 1
                });
            }
            return arr;
        }
    }
})();