(() => {
    angular.module('TournamentApp')
        .controller('TournamentController', ['$scope', '$http', TournamentController]);
        
    
    function TournamentController($scope, $http) {
        $scope.tournamentId = window.location.href.split('/')[4];
            
            $scope.tournamentContext = {
                admin: false,
                owner: false
            }
            $scope.tournamentInfo = {
                name: ''
            }
            
            let getTournamentContext = () => {
                $http.get('/api/t/' + $scope.tournamentId)
                    .then(({data}) => {
                        $scope.tournamentInfo = {
                            name: data.name,
                            location: data.location,
                            questionSet: data.questionSet,
                            description: data.description,
                        }
                        $scope.tournamentContext.admin = true;
                        $scope.tournamentContext.owner = true;
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
            
            getTournamentContext();
    }
    
})();

