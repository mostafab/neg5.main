let tournamentApp = angular.module('TournamentApp', [])
    .controller('TournamentController', ['$scope', '$http', function($scope, $http) {

        $scope.tournamentId = window.location.href.split('/')[4];
        
        $scope.tournamentContext = {
            name: 'Hehehe'
        }
        
        let getTournamentContext = () => {
            $http.get('/api/t/' + $scope.tournamentId)
                .then(({data}) => {
                    $scope.tournamentContext = {
                        name: data.name
                    }
                }, (error) => {
                    
                })
        }
        
        getTournamentContext();
        
    }])