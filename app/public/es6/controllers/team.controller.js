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

        vm.removeTeam = (id) => Team.deleteTeam(id);  
        
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
            return !vm.teams.some(team => team.id !== id && team.name.trim().toLowerCase() === name.trim().toLowerCase());
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

        vm.getTournamentTeams();

    }
    
})();