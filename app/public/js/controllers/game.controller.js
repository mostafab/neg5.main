'use strict';

(function () {

    angular.module('tournamentApp').controller('GameCtrl', ['$scope', 'Team', 'Game', 'Phase', GameCtrl]);

    function GameCtrl($scope, Team, Game, Phase) {

        var vm = this;

        vm.teams = Team.teams;
        vm.games = Game.games;
        vm.phases = Phase.phases;

        vm.sortType = 'round';
        vm.sortReverse = false;
        vm.gameQuery = '';

        vm.pointScheme = [{ value: -5 }, { value: 10 }, { value: 20 }];

        vm.pointSum = function (points) {
            return points.map(function (_ref) {
                var number = _ref.number;
                var value = _ref.value;
                return number * value || 0;
            }).reduce(function (sum, product) {
                return sum + product;
            }, 0);
        };

        vm.currentGame = {
            teams: [{
                teamInfo: null,
                players: []
            }, {
                teamInfo: null,
                players: []
            }],
            phases: [],
            round: 1,
            tuh: 20,
            room: '',
            moderator: '',
            packet: '',
            notes: ''
        };

        vm.addTeam = function (index) {
            Game.getTeamPlayers($scope.tournamentId, vm.currentGame.teams[index].teamInfo.id).then(function (players) {
                vm.currentGame.teams[index].players = players.map(function (_ref2) {
                    var name = _ref2.name;
                    var id = _ref2.id;

                    return {
                        id: id,
                        name: name,
                        points: vm.pointScheme.slice().map(function (_ref3) {
                            var value = _ref3.value;

                            return {
                                value: value,
                                number: 0
                            };
                        })
                    };
                });
                console.log(vm.currentGame.teams[index].players);
            }).catch(function (error) {
                console.log(error);
            });
        };

        vm.test = function () {
            return console.log(vm.currentGame.phases);
        };

        vm.getGames = function () {
            return Game.getGames($scope.tournamentId);
        };

        vm.addGame = function () {
            return console.log(vm.currentGame);
        };

        vm.removeGame = function (id) {
            return console.log(id);
        };

        vm.getGames();

        console.log(vm.currentGame);
    }
})();