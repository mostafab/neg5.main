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
            
            vm.tournamentInfoCopy = {};
            vm.teams = Team.teams;
            vm.games = Game.games;

            vm.editing = false;

            vm.resetOverview = () => {
                angular.copy($scope.tournamentInfo, vm.tournamentInfoCopy);
            }

            vm.editTournament = () => {
                Tournament.edit($scope.tournamentId, vm.tournamentInfoCopy)
                    .then(data => {
                        copyToOriginalTournamentObject(data);
                        vm.resetOverview();
                        vm.editing = false;
                    })
                    .catch(error => console.log(error));
            }

            let copyToOriginalTournamentObject = (data) => {
                angular.copy(data, $scope.tournamentInfo);
            }

            let getTournamentContext = () => {
                Tournament.getTournamentContext($scope.tournamentId)
                    .then(({tournamentInfo, tournamentContext}) => {
                        $scope.tournamentInfo = tournamentInfo;
                        angular.copy($scope.tournamentInfo, vm.tournamentInfoCopy)
                        $scope.tournamentContext = tournamentContext;
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
            
            getTournamentContext();
    }
    
})();

