(() => {
    angular.module('tournamentApp')
        .controller('TournamentCtrl', ['$scope', '$http', '$window', '$timeout', 'Team', 'Game', 'Tournament', TournamentCtrl]);
        
    
    function TournamentCtrl($scope, $http, $window, $timeout, Team, Game, Tournament) {

            $scope.tournamentId = $window.location.pathname.split('/')[2];

            $scope.tournamentContext = {
                admin: false,
                owner: false
            }
            $scope.tournamentInfo = {
                name: '',
                hidden: false
            }
            $scope.toastMessage = null;
            
            const timeToastShows = 3000;

            $scope.toast = ({message, success = null, hideAfter = false}) => {
                if (hideAfter) {
                    $timeout(() => {
                        $scope.toastMessage = null;
                    }, timeToastShows);
                }
                $scope.toastMessage = {
                    message,
                    success
                }                
            }

            let vm = this;

            vm.tab = 'overview';
            vm.matchTab = 'add';
            vm.teamTab = 'add';

            vm.tournamentInfoCopy = {};
            vm.teams = Team.teams;
            vm.games = Game.games;

            vm.editing = false;

            vm.resetOverview = () => {
                angular.copy($scope.tournamentInfo, vm.tournamentInfoCopy);
            }

            vm.editTournament = () => {
                if (vm.editTournamentForm.$valid) {
                    let toastConfig = {
                        message: 'Editing tournament'
                    }
                    $scope.toast(toastConfig);

                    Tournament.edit($scope.tournamentId, vm.tournamentInfoCopy)
                        .then(data => {
                            copyToOriginalTournamentObject(data);
                            vm.resetOverview();
                            vm.editing = false;
                            toastConfig.message = 'Edited tournament.';
                            toastConfig.success = true;
                        })
                        .catch(error => {
                            toastConfig.message = 'Failed to update tournament.';
                            toastConfig.success = false;
                        })
                        .finally(() => {
                            toastConfig.hideAfter = true;
                            $scope.toast(toastConfig);
                        })
                    }
            }

            let copyToOriginalTournamentObject = (data) => {
                angular.copy(data, $scope.tournamentInfo);
            }

            let getTournamentContext = () => {
                Tournament.getTournamentContext($scope.tournamentId)
                    .then(({tournamentInfo, tournamentContext}) => {
                        $scope.tournamentInfo = tournamentInfo;
                        $scope.tournamentContext = tournamentContext;
                        
                        angular.copy($scope.tournamentInfo, vm.tournamentInfoCopy)
                        
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
            
            getTournamentContext();

    }
    
})();

