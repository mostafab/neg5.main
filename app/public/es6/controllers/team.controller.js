(() => {
        
    angular.module('TournamentApp')
        .controller('TeamController', ['$scope', '$http', 'Team', TeamController]);
    
    function TeamController($scope, $http, Team) {
        
        let vm = this;

        vm.teams = Team.teams;

        vm.newTeam = {
            name: '',
            players: [
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''}   
            ],
            divisions: [
                
            ]
        }
        
        vm.teamSortType = 'team_name'
        vm.teamSortReverse = true;
        vm.teamQuery = '';
        
        vm.testClick = (index) => console.log(index);
        
        vm.getTournamentTeams = () => {
            Team.getTeams($scope.tournamentId);
        }
        
        function watchTeams() {
            return Team.teams;
        }
        
        vm.addPlayer = () => vm.newTeam.players.push({name: ''})
        
        vm.addTeam = () => {
            let {name, players} = vm.newTeam;
            let filteredPlayers = players.filter(player => player.name.length > 0);
            let formattedTeam = {
                name,
                players : filteredPlayers
            }
            Team.postTeam(formattedTeam)
                .then((id) => {
                    vm.newTeam = {
                        name: '',
                        players: [
                            {name: ''},
                            {name: ''},
                            {name: ''},
                            {name: ''}
                        ],
                        divisions: []
                    }
                    // $scope.$apply();
                })
        }
                
        // $scope.$watch(watchTeams, function(current, previous) {
        //     vm.teams = current;
        // })
        
        vm.getTournamentTeams();
    }
    
})();