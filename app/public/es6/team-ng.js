(() => {
    
    let tournamentApp = angular.module('TournamentApp', [])
        .controller('TeamController', ['$scope', '$http', ($scope, $http) => {
    
            $scope.tournamentId = window.location.href.split('/')[4];
            
            $scope.teams = [];
            $scope.admin = false;

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
            
            $scope.getTournamentTeams();
    
    }]);
    
})();

