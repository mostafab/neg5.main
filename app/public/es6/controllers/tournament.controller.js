(() => {
    angular.module('tournamentApp')
        .controller('TournamentCtrl', ['$scope', '$http', '$window', 'Team', 'Game', TournamentCtrl]);
        
    
    function TournamentCtrl($scope, $http, $window, Team, Game) {
            $scope.tournamentId = $window.location.href.split('/')[4];
            
            $scope.tournamentContext = {
                admin: false,
                owner: false
            }
            $scope.tournamentInfo = {
                name: '',
                hidden: false
            }
            
            let vm = this;
            vm.teams = Team.teams;
            vm.games = Game.games;
            console.log(vm.teams);
            
            let getTournamentContext = () => {
                $http.get('/api/t/' + $scope.tournamentId)
                    .then(({data}) => {
                        $scope.tournamentInfo = {
                            name: data.name,
                            location: data.location,
                            questionSet: data.questionSet,
                            description: data.description,
                            hidden: data.hidden || true
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

