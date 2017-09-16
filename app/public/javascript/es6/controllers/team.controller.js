(() => {
        
    angular.module('tournamentApp')
        .controller('TeamCtrl', ['$scope', '$http', 'Team', 'Phase', 'Division', 'Game', TeamCtrl]);
    
    function TeamCtrl($scope, $http, Team, Phase, Division, Game) {
        
        let vm = this;

        vm.teams = Team.teams;
        vm.phases = Phase.phases;
        vm.divisions = Division.divisions;

        let games = Game.games;

        vm.newTeam = {
            name: '',
            players: [
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''}   
            ],
            divisions: {}
        }

        vm.currentTeam = {};
        
        vm.teamSortType = 'name'
        vm.teamSortReverse = false;
        vm.teamQuery = '';
        
        vm.getTournamentTeams = () => {
            Team.getTeams($scope.tournamentId);
        }
        
        vm.addPlayer = () => vm.newTeam.players.push({name: ''})
        vm.removePlayerSlot = (index) => vm.newTeam.players.splice(index, 1);
        
        
        vm.addTeam = () => {
            if (vm.newTeamForm.$valid) {
                let toastConfig = {
                    message: 'Adding team.'
                }
                $scope.toast(toastConfig);
                Team.postTeam($scope.tournamentId, vm.newTeam)
                    .then((teamName) => {
                        resetNewTeam();
                        toastConfig.message = 'Added team: ' + teamName;
                        toastConfig.success = true;
                    })
                    .catch((error) => {
                        toastConfig.message = 'Could not add team.';
                        toastConfig.success = false;
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })
            }
        }
        
        vm.findTeam = (team) => {
            if (team.id !== vm.currentTeam.id) {
                let toastConfig = {
                    message: 'Loading Team: ' + team.name
                }
                $scope.toast(toastConfig);
                Team.getTeamById($scope.tournamentId, team.id)
                    .then(gottenTeam => {
                        angular.copy(gottenTeam, vm.currentTeam);
                        toastConfig.success = true;
                        toastConfig.message = 'Loaded team: ' + gottenTeam.name
                    })
                    .catch(error => {
                        toastConfig.success = false;
                        toastConfig.message = 'Could not load team: ' + team.name
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })
            }
            
        }

        vm.saveCurrentTeamName = () => {
            let {id, name, newName} = vm.currentTeam;
            if (name !== newName && newName.length > 0) {
                if (vm.isUniqueTeamName(id, newName)) {
                    let toastConfig = {message: `Editing team: ${name} \u2192 ${newName}`}
                    $scope.toast(toastConfig);
                    Team.editTeamName($scope.tournamentId, id, newName)
                        .then((newName) => {
                            resetCurrentTeam(newName);

                            toastConfig.success = true;
                            toastConfig.message = `Saved team name: ${name} \u2192 ${newName}`
                        })
                        .catch(error => {
                            toastConfig.success = false;
                            toastConfig.message = `Could not update team name: ${name} \u2192 ${newName}`
                        })
                        .finally(() => {
                            toastConfig.hideAfter = true;
                            $scope.toast(toastConfig);
                        })
                }
                
            } else {
                vm.currentTeam.editingName = false;
            }
        }

        vm.updateCurrentTeamDivisions = () => {
            let name = vm.currentTeam.name;
            let toastConfig = {message: 'Updating divisions for: ' + vm.currentTeam.name}
            $scope.toast(toastConfig);
            let divisionIds = Object.keys(vm.currentTeam.mappedDivisions).map(phaseId => vm.currentTeam.mappedDivisions[phaseId]);
            Team.updateTeamDivisions($scope.tournamentId, vm.currentTeam.id, vm.currentTeam.mappedDivisions, divisionIds)
                .then(() => {
                    toastConfig.success = true;
                    toastConfig.message = 'Updated divisions for: ' + name;
                })
                .catch(() => {
                    toastConfig.success = false;
                    toastConfig.message = 'Could not update divisions for: ' + name;
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                })
        }

        vm.savePlayerNameOnCurrentTeam = (player) => {
            let {name, newName, id} = player;
            if (name !== newName && newName.length > 0) {
                if (vm.isUniqueTeamPlayerName(id, newName)) {
                    let toastConfig = {message: `Editing player: ${name} \u2192 ${newName}`}
                    $scope.toast(toastConfig);
                    Team.editTeamPlayerName($scope.tournamentId, id, newName)
                        .then((savedName) => {
                            resetPlayer(player, savedName);

                            toastConfig.success = true;
                            toastConfig.message = `Saved player name: ${name} \u2192 ${savedName}`
                        })
                        .catch(error => {
                            toastConfig.success = false;
                            toastConfig.message = `Could not update player name: ${name} \u2192 ${savedName}`
                        })
                        .finally(() => {
                            toastConfig.hideAfter = true;
                            $scope.toast(toastConfig);
                        })  
                }
            } else {
                player.editing = false;
            }
        }

        vm.addTeamPlayer = () => {
            let {newPlayer, id: teamId, name} = vm.currentTeam;
            if (newPlayer.length > 0 && vm.isUniqueTeamPlayerName(null, newPlayer)) {
                let toastConfig = {message: `Adding player: ${newPlayer} to ${name}.`}
                $scope.toast(toastConfig);
                Team.addPlayer($scope.tournamentId, teamId, newPlayer)
                    .then((player) => {
                        vm.currentTeam.players.push({
                            id: player.id,
                            name: player.name,
                            newName: player.name,
                            editing: false,
                            addedBy: player.added_by,
                            games: 0
                        })
                        vm.currentTeam.newPlayer = '';
                        toastConfig.success = true;
                        toastConfig.message = `Added player: ${player.name} to ${name}`;
                    })
                    .catch(error => {
                        toastConfig.success = false;
                        toastConfig.message = `Could not add player: ${player.name} to ${name}`
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })  
            }
        }

        vm.removeCurrentTeamPlayer = (player) => {
            let toastConfig = {message: 'Deleting player: ' + player.name};
            $scope.toast(toastConfig);
            Team.deletePlayer($scope.tournamentId, player.id)
                .then((playerId) => {
                    removePlayerFromCurrentTeam(playerId);
                    toastConfig.success = true;
                    toastConfig.message = `Deleted player: ${player.name}`;
                })
                .catch(error => {
                    toastConfig.success = false;
                    toastConfig.message = `Could not delete ${player.name} because this player has games played`;
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                })  
        }

        vm.removeCurrentTeam = () => {
            let {id, name} = vm.currentTeam;
            let toastConfig = {message: 'Deleting team: ' + name};
            $scope.toast(toastConfig);
            Team.deleteTeam($scope.tournamentId, id)
                .then(() => {
                    toastConfig.success = true;
                    toastConfig.message = `Deleted team: ${name}`;
                    vm.currentTeam = {};
                })
                .catch(error => {
                    toastConfig.success = false;
                    toastConfig.message = `Could not delete ${name} because this team has games played.`;
                })
                .finally(() => {
                    toastConfig.hideAfter = true;
                    $scope.toast(toastConfig);
                })    
        }
        
        vm.getDivisionNameInPhase = (divisionId) => {
            if (!divisionId) return '';
            let division = vm.divisions.find(division => division.id === divisionId);
            if (!division) return ''; // To catch error where teams are loaded before divisions b/c of asynchronicity
            return division.name;
        }

        vm.teamHasPlayedNoGames = (teamId) => {
            return !games.some(game => game.teams.one.id === teamId || game.teams.two.id === teamId);
        }

        vm.isUniqueTeamName = (id, name) => {
            let formattedName = name.trim().toLowerCase();
            return !vm.teams.some(team => team.id !== id && team.name.trim().toLowerCase() === formattedName);
        }

        vm.isUniqueTeamPlayerName  = (playerId, name) => {
            let formattedName = name.trim().toLowerCase();
            return !vm.currentTeam.players.some(player => player.id !== playerId && player.name.trim().toLowerCase() === formattedName);
        }

        function resetNewTeam() {
            vm.newTeam = {
                name: '',
                players: [
                    {name: ''},
                    {name: ''},
                    {name: ''},
                    {name: ''}   
                ],
                divisions: {}
            }
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
            let index =  vm.currentTeam.players.findIndex(player => player.id === id);
            if (index !== -1) {
                vm.currentTeam.players.splice(index, 1);
            }
        }

        vm.getTournamentTeams();

    }
    
})();