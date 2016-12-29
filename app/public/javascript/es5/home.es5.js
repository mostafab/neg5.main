'use strict';

(function () {

    angular.module('HomeApp', ['ngCookies', 'ngAnimate']).config(function ($animateProvider) {
        $animateProvider.classNameFilter(/angular-animate/);
    });

    angular.module('HomeApp').controller('HomeController', ['$cookies', '$scope', '$http', '$timeout', '$window', function ($cookies, $scope, $http, $timeout, $window) {

        var vm = this;

        $scope.toastMessage = null;

        var timeToastShows = 3000;

        var toastPromise = null;
        $scope.toast = function (_ref) {
            var message = _ref.message;
            var _ref$success = _ref.success;
            var success = _ref$success === undefined ? null : _ref$success;
            var _ref$hideAfter = _ref.hideAfter;
            var hideAfter = _ref$hideAfter === undefined ? false : _ref$hideAfter;

            if (hideAfter) {
                if (toastPromise) {
                    $timeout.cancel(toastPromise);
                }
                toastPromise = $timeout(function () {
                    $scope.toastMessage = null;
                    toastPromise = null;
                }, timeToastShows);
            }
            $scope.toastMessage = {
                message: message,
                success: success
            };
        };

        vm.tournaments = [];
        vm.submittingForm = false;

        vm.getTournaments = function () {
            var jwt = $cookies.get('nfToken');
            $http.get('/api/t?token=' + jwt).then(function (_ref2) {
                var data = _ref2.data;

                vm.tournaments = data.data;
            }).catch(function (error) {
                return console.log(error);
            });
        };

        vm.createNewTournament = function () {
            if (vm.newTournamentForm.$valid) {
                (function () {
                    var body = {
                        token: $cookies.get('nfToken'),
                        name: vm.newTournament.name
                    };
                    var toastConfig = { message: 'Adding tournament: ' + vm.newTournament.name };
                    $scope.toast(toastConfig);
                    vm.submittingForm = true;
                    $http.post('/api/t', body).then(function (_ref3) {
                        var data = _ref3.data;

                        var tournament = data.result.tournament;
                        vm.getTournaments();
                        vm.newTournament = {};

                        toastConfig.success = true;
                        toastConfig.message = 'Added tournament: ' + tournament.name;
                    }).catch(function (error) {
                        toastConfig.success = false;
                        toastConfig.message = 'Could not add tournament.';
                    }).finally(function () {
                        toastConfig.hideAfter = true;
                        vm.submittingForm = false;
                        $scope.toast(toastConfig);
                    });
                })();
            }
        };

        vm.newTournament = {};

        $scope.logout = function () {
            $cookies.remove('nfToken');
            $window.location = '/';
        };

        vm.getTournaments();
    }]);
})();