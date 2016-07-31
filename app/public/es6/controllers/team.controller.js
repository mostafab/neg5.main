(() => {
        
    angular.module('tournamentApp')
        .controller('TeamCtrl', ['$scope', '$http', 'Team', 'Phase', 'Division', TeamCtrl]);
    
    function TeamCtrl($scope, $http, Team, Phase, Division) {
        
        let vm = this;

        vm.teams = Team.teams;
        vm.phases = Phase.phases;
        vm.divisions = Division.divisions;

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
        
        vm.teamSortType = 'name'
        vm.teamSortReverse = false;
        vm.teamQuery = '';
        
        vm.testClick = (index) => console.log(index);
        
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
                    .then(() => {
                        resetNewTeam();
                        toastConfig.message = 'Added team';
                        toastConfig.success = true;
                    })
                    .catch(() => {
                        toastConfig.message = 'Could not add team.';
                        toastConfig.success = false;
                    })
                    .finally(() => {
                        toastConfig.hideAfter = true;
                        $scope.toast(toastConfig);
                    })
            }
        }
        
        vm.removeTeam = (id) => Team.deleteTeam(id);  
        
        vm.getDivisionNameInPhase = (divisionId) => {
            if (!divisionId) return '';
            let division = vm.divisions.find(division => division.id === divisionId);
            if (!division) return ''; // To catch error where teams are loaded before divisions b/c of asynchronicity
            return division.name;
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

        vm.getTournamentTeams();

    }
    
})();