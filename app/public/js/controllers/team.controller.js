'use strict';

(function () {

    angular.module('TournamentApp').controller('TeamController', ['$scope', '$http', 'Team', TeamController]);

    function TeamController($scope, $http, Team) {

        var vm = this;

        vm.teams = Team.teams;

        vm.newTeam = {
            name: '',
            players: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }],
            divisions: []
        };

        vm.teamSortType = 'team_name';
        vm.teamSortReverse = true;
        vm.teamQuery = '';

        vm.testClick = function (index) {
            return console.log(index);
        };

        vm.getTournamentTeams = function () {
            Team.getTeams($scope.tournamentId);
        };

        function watchTeams() {
            return Team.teams;
        }

        vm.addPlayer = function () {
            return vm.newTeam.players.push({ name: '' });
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
                // $scope.$apply();
            });
        };

        // $scope.$watch(watchTeams, function(current, previous) {
        //     vm.teams = current;
        // })

        vm.getTournamentTeams();
    }
})();