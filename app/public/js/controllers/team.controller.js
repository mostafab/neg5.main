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

        vm.currentTeam = {};

        vm.teamSortType = 'name';
        vm.teamSortReverse = false;
        vm.teamQuery = '';

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
                    Team.postTeam($scope.tournamentId, vm.newTeam).then(function (teamName) {
                        resetNewTeam();
                        toastConfig.message = 'Added team: ' + teamName;
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

        vm.findTeam = function (team) {
            if (team.id !== vm.currentTeam.id) {
                (function () {
                    var toastConfig = {
                        message: 'Loading Team: ' + team.name
                    };
                    $scope.toast(toastConfig);
                    Team.getTeamById($scope.tournamentId, team.id).then(function (gottenTeam) {
                        angular.copy(gottenTeam, vm.currentTeam);
                        toastConfig.success = true;
                        toastConfig.message = 'Loaded team: ' + gottenTeam.name;
                    }).catch(function (error) {
                        toastConfig.success = false;
                        toastConfig.message = 'Could not load team: ' + team.name;
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