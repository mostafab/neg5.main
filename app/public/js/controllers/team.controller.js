'use strict';

(function () {

    angular.module('tournamentApp').controller('TeamCtrl', ['$scope', '$http', 'Team', 'Phase', 'Division', TeamCtrl]);

    function TeamCtrl($scope, $http, Team, Phase, Division) {

        var vm = this;

        vm.teams = Team.teams;
        vm.phases = Phase.phases;
        vm.divisions = Division.divisions;

        vm.newTeam = {
            name: '',
            players: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }],
            divisions: {}
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
            if (vm.newTeamForm.$valid) {
                (function () {
                    var toastConfig = {
                        message: 'Adding team.'
                    };
                    $scope.toast(toastConfig);
                    Team.postTeam($scope.tournamentId, vm.newTeam).then(function () {
                        resetNewTeam();
                        toastConfig.message = 'Added team';
                        toastConfig.success = true;
                    }).catch(function () {
                        toastConfig.message = 'Could not add team.';
                        toastConfig.success = false;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.removeTeam = function (id) {
            return Team.deleteTeam(id);
        };

        vm.getDivisionNameInPhase = function (divisionId) {
            if (!divisionId) return '';
            var division = vm.divisions.find(function (division) {
                return division.id === divisionId;
            });
            if (!division) return ''; // To catch error where teams are loaded before divisions b/c of asynchronicity
            return division.name;
        };

        function resetNewTeam() {
            vm.newTeam = {
                name: '',
                players: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }],
                divisions: {}
            };
        }

        vm.getTournamentTeams();
    }
})();