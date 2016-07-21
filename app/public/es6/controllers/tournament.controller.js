(() => {
    angular.module('tournamentApp')
        .controller('TournamentCtrl', ['$scope', '$http', '$window', 'Team', 'Game', 'Tournament', TournamentCtrl]);
        
    
    function TournamentCtrl($scope, $http, $window, Team, Game, Tournament) {
        
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
            
            let getTournamentContext = () => {
                Tournament.getTournamentContext($scope.tournamentId)
                    .then(({tournamentInfo, tournamentContext}) => {
                        $scope.tournamentInfo = tournamentInfo;
                        $scope.tournamentContext = tournamentContext;
                    })
                $http.get('/api/t/' + $scope.tournamentId)
                    .then(({data}) => {
                        $scope.tournamentInfo = {
                            name: data.name,
                            location: data.location,
                            questionSet: data.questionSet,
                            description: data.description,
                            hidden: data.hidden || true,
                            pointScheme: data.pointScheme || []
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

