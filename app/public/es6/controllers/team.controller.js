(() => {
        
    angular.module('tournamentApp')
        .controller('TeamCtrl', ['$scope', '$http', 'Team', TeamCtrl]);
    
    function TeamCtrl($scope, $http, Team) {
        
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
                })
        }
        
        vm.removeTeam = (id) => Team.deleteTeam(id);  
        
        vm.getTournamentTeams();

    }
    
})();