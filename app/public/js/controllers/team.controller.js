'use strict';

(function () {

    angular.module('tournamentApp').controller('TeamCtrl', ['$scope', '$http', 'Team', TeamCtrl]);

    function TeamCtrl($scope, $http, Team) {

        var vm = this;

        vm.teams = Team.teams;

        vm.newTeam = {
            name: '',
            players: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }],
            divisions: []
        };

        vm.teamSortType = 'name';
        vm.teamSortReverse = false;
        vm.teamQuery = '';

        vm.testClick = function (index) {
            return console.log(index);
        };

        vm.getTournamentTeams = function () {
            Team.getTeams($scope.tournamentId);
        };

        vm.addPlayer = function () {
            return vm.newTeam.players.push({ name: '' });
        };
        vm.removePlayerSlot = function (index) {
            return vm.newTeam.players.splice(index, 1);
        };

        vm.addTeam = function () {
            var _vm$newTeam = vm.newTeam;
            var name = _vm$newTeam.name;
            var players = _vm$newTeam.players;

            var filteredPlayers = players.filter(function (player) {
                return player.name.length > 0;
            });
            var formattedTeam = {
                name: name,
                players: filteredPlayers
            };
            Team.postTeam(formattedTeam).then(function (id) {
                vm.newTeam = {
                    name: '',
                    players: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }],
                    divisions: []
                };
            });
        };

        vm.removeTeam = function (id) {
            return Team.deleteTeam(id);
        };

        vm.getTournamentTeams();
    }
})();