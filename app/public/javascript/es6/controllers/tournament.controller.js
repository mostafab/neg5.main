(() => {
    angular.module('tournamentApp')
        .controller('TournamentCtrl', ['$scope', '$http', '$window', '$timeout', '$cookies', 'Team', 'Game', 'Tournament', 'Cookies', TournamentCtrl]);
        
    
    function TournamentCtrl($scope, $http, $window, $timeout, $cookies, Team, Game, Tournament, Cookies) {

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

            let toastPromise = null;
            $scope.toast = ({message, success = null, hideAfter = false}) => {
                if (hideAfter) {
                    if (toastPromise) {
                        $timeout.cancel(toastPromise);
                    }
                    toastPromise = $timeout(() => {
                        $scope.toastMessage = null;
                        toastPromise = null;
                    }, timeToastShows);
                }
                $scope.toastMessage = {
                    message,
                    success
                }                
            }

            let vm = this;

            vm.tab = Cookies.get('nfTab') || 'overview';
            vm.matchTab = Cookies.get('nfMatchTab') || 'add';
            vm.teamTab = Cookies.get('nfTeamTab') || 'add';

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
            
            let setTabWatchers = () => {
                $scope.$watch(angular.bind(vm, () => {
                    return vm.tab;
                }), (newVal) => {
                    Cookies.set('nfTab', newVal);
                });
                $scope.$watch(angular.bind(vm, () => {
                    return vm.matchTab;
                }), (newVal) => {
                    Cookies.set('nfMatchTab', newVal);
                });
                $scope.$watch(angular.bind(vm, () => {
                    return vm.teamTab;
                }), (newVal) => {
                    Cookies.set('nfTeamTab', newVal);
                });
            }
            
            $scope.logout = () => {
                $cookies.remove('nfToken', {path: '/'});
                $window.location = '/';
            }

            setTabWatchers();
            getTournamentContext();

    }
    
})();

