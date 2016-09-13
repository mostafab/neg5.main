'use strict';

(() => {

    angular.module('HomeApp', ['ngCookies', 'ngAnimate'])
        .config($animateProvider => {
            $animateProvider.classNameFilter(/angular-animate/);
        })

    angular.module('HomeApp')
        .controller('HomeController', ['$cookies', '$scope', '$http', '$timeout', '$window', function($cookies, $scope, $http, $timeout, $window) {
            
            let vm = this;

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

            vm.tournaments = [];
            vm.submittingForm = false;

            vm.getTournaments = () => {
                const jwt = $cookies.get('nfToken');
                $http.get('/api/t?token=' + jwt)
                    .then(({data}) => {
                        vm.tournaments = data.data;
                    })
                    .catch(error => console.log(error));
            }

            vm.createNewTournament = () => {
                if (vm.newTournamentForm.$valid) {
                    let body = {
                        token: $cookies.get('nfToken'),
                        name: vm.newTournament.name
                    }
                    let toastConfig = {message: 'Adding tournament: ' + vm.newTournament.name};
                    $scope.toast(toastConfig);
                    vm.submittingForm = true;
                    $http.post('/api/t', body)
                        .then(({data}) => {
                            let tournament = data.result.tournament;
                            vm.getTournaments();
                            vm.newTournament = {};

                            toastConfig.success = true;
                            toastConfig.message = 'Added tournament: ' + tournament.name;
                        })
                        .catch(error => {
                            toastConfig.success = false;
                            toastConfig.message = 'Could not add tournament.';
                        })
                        .finally(() => {
                            toastConfig.hideAfter = true;
                            vm.submittingForm = false;
                            $scope.toast(toastConfig);
                        })
                }
            }

            vm.newTournament = {};

            $scope.logout = () => {
                $cookies.remove('nfToken');
                $window.location = '/';
            }

            vm.getTournaments();

        }])

})();
