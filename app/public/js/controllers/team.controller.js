'use strict';

(function () {

    angular.module('tournamentApp').controller('TeamCtrl', ['$scope', '$http', 'Team', 'Phase', 'Division', 'Game', TeamCtrl]);

    function TeamCtrl($scope, $http, Team, Phase, Division, Game) {

        var vm = this;

        vm.teams = Team.teams;
        vm.phases = Phase.phases;
        vm.divisions = Division.divisions;

        var games = Game.games;

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
                    }).catch(function (error) {
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

        vm.saveCurrentTeamName = function () {
            var _vm$currentTeam = vm.currentTeam;
            var id = _vm$currentTeam.id;
            var name = _vm$currentTeam.name;
            var newName = _vm$currentTeam.newName;

            if (name !== newName && newName.length > 0) {
                if (vm.isUniqueTeamName(id, newName)) {
                    (function () {
                        var toastConfig = { message: 'Editing team: ' + name + ' → ' + newName };
                        $scope.toast(toastConfig);
                        Team.editTeamName($scope.tournamentId, id, newName).then(function (newName) {
                            resetCurrentTeam(newName);

                            toastConfig.success = true;
                            toastConfig.message = 'Saved team name: ' + name + ' → ' + newName;
                        }).catch(function (error) {
                            toastConfig.success = false;
                            toastConfig.message = 'Could not update team name: ' + name + ' → ' + newName;
                        }).finally(function () {
                            toastConfig.hideAfter = true;
                            $scope.toast(toastConfig);
                        });
                    })();
                }
            } else {
                vm.currentTeam.editingName = false;
            }
        };

        vm.updateCurrentTeamDivisions = function () {
            var name = vm.currentTeam.name;
            var toastConfig = { message: 'Updating divisions for: ' + vm.currentTeam.name };
            $scope.toast(toastConfig);
            var divisionIds = Object.keys(vm.currentTeam.mappedDivisions).map(function (phaseId) {
                return vm.currentTeam.mappedDivisions[phaseId];
            });
            Team.updateTeamDivisions($scope.tournamentId, vm.currentTeam.id, vm.currentTeam.mappedDivisions, divisionIds).then(function () {
                toastConfig.success = true;
                toastConfig.message = 'Updated divisions for: ' + name;
            }).catch(function () {
                toastConfig.success = false;
                toastConfig.message = 'Could not update divisions for: ' + name;
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
        };

        vm.savePlayerNameOnCurrentTeam = function (player) {
            var name = player.name;
            var newName = player.newName;
            var id = player.id;

            if (name !== newName && newName.length > 0) {
                if (vm.isUniqueTeamPlayerName(id, newName)) {
                    (function () {
                        var toastConfig = { message: 'Editing player: ' + name + ' → ' + newName };
                        $scope.toast(toastConfig);
                        Team.editTeamPlayerName($scope.tournamentId, id, newName).then(function (savedName) {
                            resetPlayer(player, savedName);

                            toastConfig.success = true;
                            toastConfig.message = 'Saved player name: ' + name + ' → ' + savedName;
                        }).catch(function (error) {
                            toastConfig.success = false;
                            toastConfig.message = 'Could not update player name: ' + name + ' → ' + savedName;
                        }).finally(function () {
                            toastConfig.hideAfter = true;
                            $scope.toast(toastConfig);
                        });
                    })();
                }
            } else {
                player.editing = false;
            }
        };

        vm.addTeamPlayer = function () {
            var _vm$currentTeam2 = vm.currentTeam;
            var newPlayer = _vm$currentTeam2.newPlayer;
            var teamId = _vm$currentTeam2.id;
            var name = _vm$currentTeam2.name;

            if (newPlayer.length > 0 && vm.isUniqueTeamPlayerName(null, newPlayer)) {
                (function () {
                    var toastConfig = { message: 'Adding player: ' + newPlayer + ' to ' + name + '.' };
                    $scope.toast(toastConfig);
                    Team.addPlayer($scope.tournamentId, teamId, newPlayer).then(function (player) {
                        vm.currentTeam.players.push({
                            id: player.id,
                            name: player.name,
                            newName: player.name,
                            editing: false,
                            addedBy: player.added_by
                        });
                        vm.currentTeam.newPlayer = '';
                        toastConfig.success = true;
                        toastConfig.message = 'Added player: ' + player.name + ' to ' + name;
                    }).catch(function (error) {
                        toastConfig.success = false;
                        toastConfig.message = 'Could not add player: ' + player.name + ' to ' + name;
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.removeCurrentTeamPlayer = function (player) {
            var toastConfig = { message: 'Deleting player: ' + player.name };
            $scope.toast(toastConfig);
            Team.deletePlayer($scope.tournamentId, player.id).then(function (playerId) {
                removePlayerFromCurrentTeam(playerId);
                toastConfig.success = true;
                toastConfig.message = 'Deleted player: ' + player.name;
            }).catch(function (error) {
                toastConfig.success = false;
                toastConfig.message = 'Could not delete player: ' + player.name;
            }).finally(function () {
                toastConfig.hideAfter = true;
                $scope.toast(toastConfig);
            });
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

        vm.teamHasPlayedNoGames = function (teamId) {
            return !games.some(function (game) {
                return game.teams.one.id === teamId || game.teams.two.id === teamId;
            });
        };

        vm.isUniqueTeamName = function (id, name) {
            var formattedName = name.trim().toLowerCase();
            return !vm.teams.some(function (team) {
                return team.id !== id && team.name.trim().toLowerCase() === formattedName;
            });
        };

        vm.isUniqueTeamPlayerName = function (playerId, name) {
            var formattedName = name.trim().toLowerCase();
            return !vm.currentTeam.players.some(function (player) {
                return player.id !== playerId && player.name.trim().toLowerCase() === formattedName;
            });
        };

        function resetNewTeam() {
            vm.newTeam = {
                name: '',
                players: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }],
                divisions: {}
            };
        }

        function resetCurrentTeam(name) {
            vm.currentTeam.newName = name;
            vm.currentTeam.name = name;
            vm.currentTeam.editingName = false;
        }

        function resetPlayer(player, name) {
            player.name = name;
            player.newName = name;
            player.editing = false;
        }

        function removePlayerFromCurrentTeam(id) {
            var index = vm.currentTeam.players.findIndex(function (player) {
                return player.id === id;
            });
            if (index !== -1) {
                vm.currentTeam.players.splice(index, 1);
            }
        }

        vm.getTournamentTeams();
    }
})();