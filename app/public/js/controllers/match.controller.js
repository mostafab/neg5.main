'use strict';

(function () {

    angular.module('tournamentApp').filter('preventSameMatchTeams', function () {
        return function (items, otherTeamId) {
            return items.filter(function (item) {
                return item.id !== otherTeamId;
            });
        };
    });

    angular.module('tournamentApp').controller('GameCtrl', ['$scope', 'Team', 'Game', 'Phase', 'Tournament', GameCtrl]);

    function GameCtrl($scope, Team, Game, Phase, Tournament) {

        var vm = this;

        vm.teams = Team.teams;
        vm.games = Game.games;
        vm.phases = Phase.phases;

        vm.sortType = 'round';
        vm.sortReverse = false;
        vm.gameQuery = '';

        vm.pointScheme = Tournament.pointScheme;

        vm.pointSum = function (points) {
            var values = Object.keys(points);
            return values.reduce(function (sum, current) {
                var product = points[current + ''] * current || 0;
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

        vm.addTeam = function (team) {
            var toastConfig = { message: 'Loading ' + team.teamInfo.name + ' players.' };
            $scope.toast(toastConfig);
            Game.getTeamPlayers($scope.tournamentId, team.teamInfo.id).then(function (players) {
                team.players = players.map(function (_ref) {
                    var name = _ref.name;
                    var id = _ref.id;

                    return {
                        id: id,
                        name: name,
                        points: vm.pointScheme.tossupValues.reduce(function (obj, current) {
                            obj[current.value] = 0;
                            return obj;
                        }, {}),
                        tuh: 0
                    };
                });
                toastConfig.success = true;
                toastConfig.message = 'Loaded ' + team.teamInfo.name + ' players (' + team.players.length + ')';
            }).catch(function (error) {
                toastConfig.success = false;
                toastConfig.message = 'Could not load team.';
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
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

        vm.displayTeamInOptions = function (id, otherSelectedTeam) {
            console.log(id);
        };

        vm.getGames();
    }
})();