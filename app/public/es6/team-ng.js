(() => {
        
    tournamentApp.controller('TeamController', ['$scope', '$http', ($scope, $http) => {
        
        $scope.teams = [];
        
        $scope.newTeam = {
            name: '',
            players: [
                {name: ''},
                {name: ''},
                {name: ''},
                {name: ''}   
            ]
        }

        $scope.getTournamentTeams = () => {
            let query = {
                method: 'GET',
                url: '/t/' + $scope.tournamentId + "/teams"
            }
            $http(query)
                .then(({data}) => {
                    
                    let {admin, teams} = data;
                    $scope.admin = false;
                    $scope.teams = teams;
                    
                }, error => {
                    
                })
        }
        
        $scope.addPlayer = () => $scope.newTeam.players.push({name: ''})
        
        $scope.addTeam = () => {
            console.log($scope.newTeam)
        }
        
        $scope.getTournamentTeams();
    
    }]);
    
})();

